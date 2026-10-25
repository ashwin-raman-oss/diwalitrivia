import type { Team, TileData } from '../types';
import Picture from '../components/Picture';

interface Props {
  category: string;
  tile: TileData;
  teams: Team[];
  showAccept: boolean;
  onAward: (team: number) => void;
  onNoOne: () => void;
  onBack: () => void;
}

export default function AnswerScreen(props: Props) {
  const { category, tile, teams, showAccept } = props;
  // Fall back to the question image when there is no separate reveal image.
  const image = tile.answerImage ?? tile.questionImage;

  return (
    <div className="screen clue">
      <header className="clue__head">
        <div className="clue__cat">
          {category} <span className="clue__value">
            <sup>$</sup>
            {tile.value}
          </span>
        </div>
        <div className="clue__links">
          {tile.accept && <span className="clue__hint">H · host note</span>}
          <button className="link" onClick={props.onBack} title="Return without using this tile">
            Back to board <kbd>Esc</kbd>
          </button>
        </div>
      </header>

      <main className={`clue__body${image ? '' : ' clue__body--text'}`}>
        <Picture src={image} alt="Answer reveal" />
        {!(tile.imageOnly && tile.answerImage) && <p className="clue__answer">{tile.answer}</p>}
        {tile.funFact && <p className="clue__fact">{tile.funFact}</p>}
        {showAccept && tile.accept && (
          <p className="clue__accept">
            <span>Host note</span> {tile.accept}
          </p>
        )}
      </main>

      <footer className="award">
        <p className="award__label">Who got it?</p>
        <div className="award__row">
          {teams.map((t, i) => (
            <button key={i} className="award__btn" onClick={() => props.onAward(i)}>
              <kbd>{i + 1}</kbd>
              <span className="award__name">{t.name}</span>
            </button>
          ))}
          <button className="award__btn award__btn--none" onClick={props.onNoOne}>
            <kbd>N</kbd>
            <span className="award__name">No one got it</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
