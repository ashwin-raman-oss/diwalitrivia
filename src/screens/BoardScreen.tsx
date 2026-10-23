import type { CSSProperties } from 'react';
import type { GameState, QuestionSet } from '../types';
import { tileKey } from '../types';
import Tile from '../components/Tile';
import Scoreboard from '../components/Scoreboard';
import FitText from '../components/FitText';

interface Props {
  questions: QuestionSet;
  state: GameState;
  canUndo: boolean;
  onPick: (cat: number, tile: number) => void;
  onUndo: () => void;
  onAdjust: () => void;
  onReset: () => void;
}

export default function BoardScreen({ questions, state, canUndo, onPick, onUndo, onAdjust, onReset }: Props) {
  const cats = questions.categories;
  const rows = Math.max(...cats.map((c) => c.tiles.length));
  // Show each column lowest value first, whatever order the JSON uses.
  const order = cats.map((c) =>
    c.tiles.map((_, i) => i).sort((a, b) => c.tiles[a].value - c.tiles[b].value),
  );

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cats.length; c++) {
      const t = order[c][r];
      cells.push(
        t === undefined ? (
          <div key={`${c}-empty-${r}`} />
        ) : (
          <Tile
            key={tileKey(c, t)}
            value={cats[c].tiles[t].value}
            used={state.used.includes(tileKey(c, t))}
            onPick={() => onPick(c, t)}
          />
        ),
      );
    }
  }

  return (
    <div className="screen board-screen">
      <header className="topbar">
        <div className="topbar__title">{questions.title}</div>
        <div className="host-controls">
          <button className="btn btn--host" onClick={onUndo} disabled={!canUndo} title="Ctrl+Z">
            Undo
          </button>
          <button className="btn btn--host" onClick={onAdjust}>
            Adjust scores
          </button>
          <button className="btn btn--host" onClick={onReset}>
            Reset game
          </button>
        </div>
      </header>

      <div
        className="board"
        style={{ '--cols': cats.length, '--rows': rows } as CSSProperties}
      >
        {cats.map((cat, c) => (
          <div className="cat" key={`cat-${c}`}>
            <FitText className="cat__name" text={cat.name} />
          </div>
        ))}
        {cells}
      </div>

      <Scoreboard teams={state.teams} highlight={state.pickIndex} label="Your pick" />
    </div>
  );
}
