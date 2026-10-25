import type { TileData } from '../types';
import Picture from '../components/Picture';

interface Props {
  category: string;
  tile: TileData;
  answeringTeam: string;
  onReveal: () => void;
  onBack: () => void;
}

/** Text-only clues shrink with length so long, story-style questions still fit on one screen. */
function textOnlySize(text: string): string {
  const n = text.length;
  if (n > 300) return '6vh';
  if (n > 200) return '7vh';
  if (n > 120) return '8vh';
  return '9vh';
}

export default function QuestionScreen({ category, tile, answeringTeam, onReveal, onBack }: Props) {
  return (
    <div className="screen clue">
      <header className="clue__head">
        <div className="clue__cat">
          {category} <span className="clue__value">
            <sup>$</sup>
            {tile.value}
          </span>
        </div>
        <div className="answering">
          <span className="answering__label">Answering</span> <strong>{answeringTeam}</strong>
        </div>
      </header>

      <main className={`clue__body${tile.questionImage ? '' : ' clue__body--text'}`}>
        <Picture src={tile.questionImage} alt="Question clue" />
        <p
          className="clue__question"
          style={tile.questionImage ? undefined : { fontSize: textOnlySize(tile.question) }}
        >
          {tile.question}
        </p>
      </main>

      <footer className="clue__actions">
        <button className="btn btn--secondary" onClick={onBack}>
          Back to board <kbd>Esc</kbd>
        </button>
        <button className="btn btn--primary btn--big" onClick={onReveal} autoFocus>
          Reveal answer <kbd>Space</kbd>
        </button>
      </footer>
    </div>
  );
}
