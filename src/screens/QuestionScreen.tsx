import type { TileData } from '../types';
import Picture from '../components/Picture';

interface Props {
  category: string;
  tile: TileData;
  answeringTeam: string;
  onReveal: () => void;
  onBack: () => void;
}

export default function QuestionScreen({ category, tile, answeringTeam, onReveal, onBack }: Props) {
  return (
    <div className="screen clue">
      <header className="clue__head">
        <div className="clue__cat">
          {category} <span className="clue__value">${tile.value}</span>
        </div>
        <div className="answering">
          Answering: <strong>{answeringTeam}</strong>
        </div>
      </header>

      <main className={`clue__body${tile.questionImage ? '' : ' clue__body--text'}`}>
        <Picture src={tile.questionImage} alt="Question clue" />
        <p className="clue__question">{tile.question}</p>
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
