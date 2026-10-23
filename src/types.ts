export interface TileData {
  value: number;
  question: string;
  answer: string;
  questionImage?: string;
  answerImage?: string;
  accept?: string;
  funFact?: string;
}

export interface Category {
  name: string;
  tiles: TileData[];
}

export interface QuestionSet {
  title: string;
  categories: Category[];
}

export interface Team {
  name: string;
  score: number;
}

/** The tile currently on screen (question or answer view). */
export interface OpenTile {
  cat: number;
  tile: number;
  revealed: boolean;
}

export interface GameState {
  teams: Team[];
  /** Keys of used tiles, see tileKey(). */
  used: string[];
  /** Team index whose pick it is. */
  pickIndex: number;
  open: OpenTile | null;
  /** True once the host leaves the final screen to look back at the board. */
  reviewing: boolean;
}

export interface Store {
  present: GameState;
  /** Snapshots taken before each undoable action, oldest first. */
  history: GameState[];
}

export const tileKey = (cat: number, tile: number) => `${cat}-${tile}`;

/** Resolve a path from questions.json against the app's base URL. */
export const assetUrl = (path: string) =>
  /^(https?:|data:)/.test(path) ? path : import.meta.env.BASE_URL + path.replace(/^\.?\//, '');
