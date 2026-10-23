import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { QuestionSet, Store } from './types';
import { assetUrl } from './types';
import { gameReducer, newGame, nextUntried } from './state/gameReducer';
import type { Action } from './state/gameReducer';
import { clearGame, loadGame, saveGame } from './state/storage';
import SetupScreen from './screens/SetupScreen';
import BoardScreen from './screens/BoardScreen';
import QuestionScreen from './screens/QuestionScreen';
import AnswerScreen from './screens/AnswerScreen';
import FinalScreen from './screens/FinalScreen';
import Modal from './components/Modal';
import { money } from './components/format';

type Phase = 'setup' | 'game';
type Dialog = null | 'reset' | 'newGame' | 'adjust';

/** Try every image path in the question set; resolve with the ones that fail. */
function findMissingImages(q: QuestionSet): Promise<string[]> {
  const paths = new Set<string>();
  for (const c of q.categories)
    for (const t of c.tiles) {
      if (t.questionImage) paths.add(t.questionImage);
      if (t.answerImage) paths.add(t.answerImage);
    }
  return Promise.all(
    [...paths].map(
      (p) =>
        new Promise<string | null>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(null);
          img.onerror = () => resolve(p);
          img.src = assetUrl(p);
        }),
    ),
  ).then((r) => r.filter((p): p is string => p !== null));
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else document.documentElement.requestFullscreen().catch(() => {});
}

export default function App() {
  const [questions, setQuestions] = useState<QuestionSet | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [missingImages, setMissingImages] = useState<string[]>([]);

  const [saved, setSaved] = useState<Store | null>(() => loadGame());
  const [phase, setPhase] = useState<Phase>('setup');
  const [store, dispatch] = useReducer(gameReducer, saved ?? newGame(['Team 1', 'Team 2']));
  const [dialog, setDialog] = useState<Dialog>(null);
  const [showAccept, setShowAccept] = useState(false);
  const [lastNames, setLastNames] = useState<string[]>([]);

  useEffect(() => {
    fetch(assetUrl('questions.json'), { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<QuestionSet>;
      })
      .then((q) => {
        if (!Array.isArray(q?.categories) || q.categories.length === 0)
          throw new Error('No "categories" array found.');
        setQuestions(q);
        document.title = q.title || 'Trivia Board';
        findMissingImages(q).then(setMissingImages);
      })
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  // Persist after every action once a game is running.
  useEffect(() => {
    if (phase === 'game') saveGame(store);
  }, [store, phase]);

  const { present: state } = store;
  const open = state.open;
  const openTile = open && questions ? questions.categories[open.cat]?.tiles[open.tile] : null;

  // Hide the host note whenever a different tile or team comes up.
  useEffect(() => setShowAccept(false), [open?.cat, open?.tile]);

  const totalTiles = questions?.categories.reduce((n, c) => n + c.tiles.length, 0) ?? 0;
  const allUsed = totalTiles > 0 && state.used.length >= totalTiles;
  const screen =
    phase === 'setup'
      ? 'setup'
      : open && openTile
        ? open.revealed
          ? 'answer'
          : 'question'
        : allUsed && !state.reviewing
          ? 'final'
          : 'board';

  const act = useCallback((a: Action) => dispatch(a), []);
  const award = (team: number) =>
    openTile && act({ type: 'award', team, value: openTile.value });

  const startNewGame = () => {
    clearGame();
    setSaved(null);
    setLastNames(state.teams.map((t) => t.name));
    setPhase('setup');
    setDialog(null);
  };

  // Keyboard shortcuts. Kept in a ref so the listener always sees fresh state.
  const keyHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandler.current = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
    const key = e.key.toLowerCase();

    if (dialog) {
      if (key === 'escape') setDialog(null);
      return;
    }
    if (key === 'f' && !e.metaKey && !e.ctrlKey) return toggleFullscreen();
    if (phase !== 'game') return;

    if ((e.ctrlKey || e.metaKey) && key === 'z') {
      e.preventDefault();
      return act({ type: 'undo' });
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const handled = () => {
      e.preventDefault();
      (document.activeElement as HTMLElement | null)?.blur();
    };

    if (screen === 'question') {
      if (key === ' ') return handled(), act({ type: 'reveal' });
      if (key === 'escape') return handled(), act({ type: 'back' });
    } else if (screen === 'answer' && open) {
      const n = Number(key);
      if (n >= 1 && n <= state.teams.length) return handled(), award(n - 1);
      if (key === 'w') return handled(), act({ type: 'pass' });
      if (key === 'n') return handled(), act({ type: 'noOne' });
      if (key === 'h') return handled(), setShowAccept((s) => !s);
      if (key === 'escape') return handled(), act({ type: 'back' });
    } else if (screen === 'final') {
      if (key === 'escape') return handled(), act({ type: 'review' });
    }
  };
  useEffect(() => {
    const listener = (e: KeyboardEvent) => keyHandler.current(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  if (loadError)
    return (
      <div className="screen setup">
        <h1 className="setup__title">Could not load questions.json</h1>
        <div className="warning">
          {loadError}
          <br />
          Check that <code>public/questions.json</code> exists and is valid JSON.
        </div>
      </div>
    );
  if (!questions) return <div className="screen loading">Loading…</div>;

  let body;
  switch (screen) {
    case 'setup':
      body = (
        <SetupScreen
          title={questions.title}
          missingImages={missingImages}
          saved={saved}
          totalTiles={totalTiles}
          initialNames={lastNames}
          onResume={() => {
            // Resume exactly where it was left, including an open tile.
            dispatch({ type: 'load', store: loadGame() ?? saved! });
            setPhase('game');
          }}
          onDiscardSaved={() => {
            clearGame();
            setSaved(null);
          }}
          onStart={(names) => {
            dispatch({ type: 'load', store: newGame(names) });
            setPhase('game');
          }}
        />
      );
      break;
    case 'board':
      body = (
        <BoardScreen
          questions={questions}
          state={state}
          canUndo={store.history.length > 0}
          onPick={(cat, tile) => act({ type: 'open', cat, tile })}
          onUndo={() => act({ type: 'undo' })}
          onAdjust={() => setDialog('adjust')}
          onReset={() => setDialog('reset')}
        />
      );
      break;
    case 'question':
      body = (
        <QuestionScreen
          key={`q-${open!.cat}-${open!.tile}`}
          category={questions.categories[open!.cat].name}
          tile={openTile!}
          answeringTeam={state.teams[open!.answering].name}
          onReveal={() => act({ type: 'reveal' })}
          onBack={() => act({ type: 'back' })}
        />
      );
      break;
    case 'answer':
      body = (
        <AnswerScreen
          key={`a-${open!.cat}-${open!.tile}`}
          category={questions.categories[open!.cat].name}
          tile={openTile!}
          teams={state.teams}
          answering={open!.answering}
          tried={open!.tried}
          nextTeam={nextUntried(state)}
          showAccept={showAccept}
          onAward={award}
          onPass={() => act({ type: 'pass' })}
          onNoOne={() => act({ type: 'noOne' })}
          onBack={() => act({ type: 'back' })}
        />
      );
      break;
    case 'final':
      body = (
        <FinalScreen
          title={questions.title}
          teams={state.teams}
          onReview={() => act({ type: 'review' })}
          onNewGame={() => setDialog('newGame')}
        />
      );
      break;
  }

  return (
    <>
      {body}
      {(dialog === 'reset' || dialog === 'newGame') && (
        <Modal
          title={dialog === 'reset' ? 'Reset the game?' : 'Start a new game?'}
          onClose={() => setDialog(null)}
          actions={
            <>
              <button className="btn btn--secondary" onClick={() => setDialog(null)} autoFocus>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={startNewGame}>
                {dialog === 'reset' ? 'Reset everything' : 'New game'}
              </button>
            </>
          }
        >
          <p>All scores, used tiles and undo history will be cleared.</p>
        </Modal>
      )}
      {dialog === 'adjust' && (
        <Modal
          title="Adjust scores"
          onClose={() => setDialog(null)}
          actions={
            <button className="btn btn--secondary" onClick={() => setDialog(null)} autoFocus>
              Done
            </button>
          }
        >
          <div className="adjust">
            {state.teams.map((t, i) => (
              <div className="adjust__row" key={i}>
                <span className="adjust__name">{t.name}</span>
                <button
                  className="btn btn--secondary"
                  onClick={() => act({ type: 'adjust', team: i, delta: -100 })}
                >
                  −100
                </button>
                <span className="adjust__score">{money(t.score)}</span>
                <button
                  className="btn btn--secondary"
                  onClick={() => act({ type: 'adjust', team: i, delta: 100 })}
                >
                  +100
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
