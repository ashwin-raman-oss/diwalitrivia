import { useState } from 'react';
import type { Store } from '../types';
import Modal from '../components/Modal';
import { money } from '../components/format';

interface Props {
  title: string;
  missingImages: string[];
  saved: Store | null;
  totalTiles: number;
  initialNames: string[];
  onResume: () => void;
  onDiscardSaved: () => void;
  onStart: (names: string[]) => void;
}

const MIN_TEAMS = 2;
const MAX_TEAMS = 4;
const DEFAULT_NAMES = ['Team 1', 'Team 2', 'Team 3', 'Team 4'];
const isDefaultName = (name: string) => /^team \d+$/i.test(name.trim());

/** Remove a team, renumbering any names still left at their "Team N" default. */
const removeAt = (names: string[], index: number) =>
  names
    .filter((_, i) => i !== index)
    .map((n, i) => (isDefaultName(n) ? `Team ${i + 1}` : n));

export default function SetupScreen(props: Props) {
  const { title, missingImages, saved, totalTiles, onResume, onDiscardSaved, onStart } = props;
  const [names, setNames] = useState<string[]>(
    props.initialNames.length >= MIN_TEAMS ? props.initialNames : DEFAULT_NAMES,
  );
  const [confirmNew, setConfirmNew] = useState(false);

  const setName = (i: number, name: string) =>
    setNames((n) => n.map((old, j) => (j === i ? name : old)));

  const start = () => onStart(names.map((n, i) => n.trim() || `Team ${i + 1}`));

  return (
    <div className="screen setup">
      <header className="setup__head">
        <p className="eyebrow">House party edition</p>
        <h1 className="setup__title">{title}</h1>
      </header>

      {missingImages.length > 0 && (
        <div className="warning" role="alert">
          <strong>
            {missingImages.length} image{missingImages.length > 1 ? 's' : ''} could not be loaded.
          </strong>{' '}
          The game still works; those tiles will show text only.
          <ul>
            {missingImages.map((m) => (
              <li key={m}>
                <code>{m}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {saved ? (
        <div className="setup__panel">
          <p className="setup__lede">
            A game is in progress: {saved.present.used.length} of {totalTiles} tiles played.
          </p>
          <ul className="setup__saved">
            {saved.present.teams.map((t, i) => (
              <li key={i}>
                <span>{t.name}</span>
                <span className="setup__saved-score">{money(t.score)}</span>
              </li>
            ))}
          </ul>
          <div className="setup__actions">
            <button className="btn btn--primary" onClick={onResume} autoFocus>
              Resume game
            </button>
            <button className="btn btn--secondary" onClick={() => setConfirmNew(true)}>
              New game
            </button>
          </div>
        </div>
      ) : (
        <form
          className="setup__panel"
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
        >
          <p className="setup__lede">Teams, in the order they pick</p>
          {names.map((name, i) => (
            <div className="setup__row" key={i}>
              <span className="setup__num">{i + 1}.</span>
              <input
                className="input"
                value={name}
                placeholder={`Team ${i + 1}`}
                maxLength={24}
                onChange={(e) => setName(i, e.target.value)}
              />
              {names.length > MIN_TEAMS && (
                <button
                  type="button"
                  className="link"
                  aria-label={`Remove team ${i + 1}`}
                  onClick={() => setNames((n) => removeAt(n, i))}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <div className="setup__actions">
            {names.length < MAX_TEAMS && (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setNames((n) => [...n, `Team ${n.length + 1}`])}
              >
                Add team
              </button>
            )}
            <button type="submit" className="btn btn--primary">
              Start game
            </button>
          </div>
        </form>
      )}

      <p className="setup__hint">Press F for full screen.</p>

      {confirmNew && (
        <Modal
          title="Start a new game?"
          onClose={() => setConfirmNew(false)}
          actions={
            <>
              <button className="btn btn--secondary" onClick={() => setConfirmNew(false)} autoFocus>
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={() => {
                  setConfirmNew(false);
                  setNames(saved!.present.teams.map((t) => t.name));
                  onDiscardSaved();
                }}
              >
                Discard and start over
              </button>
            </>
          }
        >
          <p>The saved scores and board will be cleared.</p>
        </Modal>
      )}
    </div>
  );
}
