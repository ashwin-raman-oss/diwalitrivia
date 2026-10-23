import type { Team } from '../types';
import { money } from '../components/format';

interface Props {
  title: string;
  teams: Team[];
  onReview: () => void;
  onNewGame: () => void;
}

export default function FinalScreen({ title, teams, onReview, onNewGame }: Props) {
  const ranked = [...teams].sort((a, b) => b.score - a.score);
  const top = ranked[0].score;
  const winners = ranked.filter((t) => t.score === top);

  return (
    <div className="screen final">
      <p className="final__eyebrow">{title}</p>
      <h1 className="final__title">Thanks for playing</h1>
      <p className="final__winner">
        {winners.length > 1 ? (
          <>
            A tie between <span>{winners.map((w) => w.name).join(' and ')}</span>
          </>
        ) : (
          <>
            <span>{winners[0].name}</span> takes it
          </>
        )}
      </p>

      <ol className="final__list">
        {ranked.map((t, i) => (
          <li key={i} className={t.score === top ? 'final__row final__row--win' : 'final__row'}>
            <span className="final__rank">{ranked.findIndex((r) => r.score === t.score) + 1}</span>
            <span className="final__name">{t.name}</span>
            <span className="final__score">{money(t.score)}</span>
          </li>
        ))}
      </ol>

      <div className="final__actions">
        <button className="btn btn--secondary" onClick={onReview}>
          Back to board
        </button>
        <button className="btn btn--primary" onClick={onNewGame}>
          New game
        </button>
      </div>
    </div>
  );
}
