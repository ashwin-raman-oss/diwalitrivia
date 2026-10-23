import type { Team } from '../types';
import { money } from './format';

interface Props {
  teams: Team[];
  /** Team index to highlight. */
  highlight: number | null;
  label: string;
}

export default function Scoreboard({ teams, highlight, label }: Props) {
  return (
    <div className="scoreboard">
      {teams.map((team, i) => (
        <div key={i} className={`score${i === highlight ? ' score--active' : ''}`}>
          <div className="score__label">{i === highlight ? label : ' '}</div>
          <div className="score__name">{team.name}</div>
          <div className="score__value">{money(team.score)}</div>
        </div>
      ))}
    </div>
  );
}
