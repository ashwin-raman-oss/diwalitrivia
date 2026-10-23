import type { Store } from '../types';
import { HISTORY_LIMIT } from './gameReducer';

const KEY = 'trivia-board:game:v1';

export function loadGame(): Store | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as Store;
    if (!store?.present?.teams?.length || !Array.isArray(store.history)) return null;
    return store;
  } catch {
    return null;
  }
}

export function saveGame(store: Store) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...store, history: store.history.slice(-HISTORY_LIMIT) }),
    );
  } catch {
    // Storage full or blocked: the game keeps running in memory.
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
