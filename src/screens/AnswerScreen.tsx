import type { Team, TileData } from '../types';
import Picture from '../components/Picture';

interface Props {
  category: string;
  tile: TileData;
  teams: Team[];
  answering: number;
  tried: number[];
  nextTeam: number | null;
  showAccept: boolean;
  onAward: (team: number) => void;
  onPass: () => void;
  onNoOne: () => void;
  onBack: () => void;
}

export default function AnswerScreen(props: Props) {
  const { category, tile, teams, answering, tried, nextTeam, showAccept } = props;
  // Fall back to the question image when there is no separate reveal image.
  const image = tile.answerImage ?? tile.questionImage;

  return (
    <div className="screen clue">
      <header className="clue__head">
        <div className="clue__cat">
          {category} <span className="clue__value">${tile.value}</span>
        </div>
        <div className="answering">
          Answering: <strong>{teams[answering].name}</strong>
        </div>
      </header>

      <main className={`clue__body${image ? '' : ' clue__body--text'}`}>
        <Picture src={image} alt="Answer reveal" />
        <p className="clue__answer">{tile.answer}</p>
        {tile.funFact && <p className="clue__fact">{tile.funFact}</p>}
        {showAccept && tile.accept && (
          <p className="clue__accept">
            <span>Host note</span> {tile.accept}
          </p>
        )}
      </main>

      <footer className="clue__footer">
        <div className="clue__actions">
          <button className="btn btn--primary btn--big" onClick={() => props.onAward(answering)}>
            Correct <kbd>{answering + 1}</kbd>
          </button>
          {nextTeam !== null && (
            <button className="btn btn--secondary btn--big" onClick={props.onPass}>
              Wrong, pass to {teams[nextTeam].name} <kbd>W</kbd>
            </button>
          )}
          <button className="btn btn--secondary btn--big" onClick={props.onNoOne}>
            No one got it <kbd>N</kbd>
          </button>
        </div>
        <div className="override">
          <span className="override__label">Award to</span>
          {teams.map((t, i) => (
            <button
              key={i}
              className={`btn btn--host${tried.includes(i) ? '' : ' btn--untried'}`}
              onClick={() => props.onAward(i)}
            >
              <kbd>{i + 1}</kbd> {t.name}
            </button>
          ))}
          <button className="btn btn--host" onClick={props.onBack} title="Return without using this tile">
            Back to board <kbd>Esc</kbd>
          </button>
          {tile.accept && <span className="override__hint">H: host note</span>}
        </div>
      </footer>
    </div>
  );
}
