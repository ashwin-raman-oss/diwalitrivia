import type { GameState, Store } from '../types';
import { tileKey } from '../types';

export const HISTORY_LIMIT = 50;

export type Action =
  | { type: 'open'; cat: number; tile: number }
  | { type: 'reveal' }
  | { type: 'back' }
  | { type: 'award'; team: number; value: number }
  | { type: 'noOne' }
  | { type: 'adjust'; team: number; delta: number }
  | { type: 'review' }
  | { type: 'undo' }
  | { type: 'load'; store: Store };

export function newGame(teamNames: string[]): Store {
  return {
    present: {
      teams: teamNames.map((name) => ({ name, score: 0 })),
      used: [],
      pickIndex: 0,
      open: null,
      reviewing: false,
    },
    history: [],
  };
}

/** Close the open tile and hand the pick to the team after the picker. */
function closeTile(state: GameState): GameState {
  if (!state.open) return state;
  return {
    ...state,
    used: [...state.used, tileKey(state.open.cat, state.open.tile)],
    pickIndex: (state.pickIndex + 1) % state.teams.length,
    open: null,
  };
}

/** Apply an action to the present state. Returns null for actions that do nothing. */
function apply(state: GameState, action: Exclude<Action, { type: 'undo' | 'load' }>): GameState | null {
  switch (action.type) {
    case 'open': {
      if (state.open || state.used.includes(tileKey(action.cat, action.tile))) return null;
      return {
        ...state,
        open: { cat: action.cat, tile: action.tile, revealed: false },
      };
    }
    case 'reveal':
      if (!state.open || state.open.revealed) return null;
      return { ...state, open: { ...state.open, revealed: true } };
    case 'back':
      if (!state.open) return null;
      return { ...state, open: null };
    case 'award': {
      if (!state.open || !state.teams[action.team]) return null;
      return {
        ...closeTile(state),
        teams: state.teams.map((t, i) =>
          i === action.team ? { ...t, score: t.score + action.value } : t,
        ),
      };
    }
    case 'noOne':
      if (!state.open) return null;
      return closeTile(state);
    case 'adjust':
      if (!state.teams[action.team]) return null;
      return {
        ...state,
        teams: state.teams.map((t, i) =>
          i === action.team ? { ...t, score: t.score + action.delta } : t,
        ),
      };
    case 'review':
      return { ...state, reviewing: true };
  }
}

/** Actions that change scores or the board go on the undo stack; navigation does not. */
const UNDOABLE = new Set<Action['type']>(['award', 'noOne', 'adjust']);

export function gameReducer(store: Store, action: Action): Store {
  if (action.type === 'load') return action.store;
  if (action.type === 'undo') {
    if (store.history.length === 0) return store;
    return {
      present: store.history[store.history.length - 1],
      history: store.history.slice(0, -1),
    };
  }
  const next = apply(store.present, action);
  if (!next) return store;
  if (!UNDOABLE.has(action.type)) return { ...store, present: next };
  return {
    present: next,
    history: [...store.history, store.present].slice(-HISTORY_LIMIT),
  };
}
