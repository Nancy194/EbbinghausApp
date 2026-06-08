import type { AppState, DayRecord, Entry, PersistedData, ReviewCompletion } from '../types';

export type Action =
  | { type: 'SET_NICKNAME'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_DATA'; payload: PersistedData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SELECT_DATE'; payload: string }
  | { type: 'ADD_ENTRY'; payload: { date: string; entry: Entry } }
  | {
      type: 'EDIT_ENTRY';
      payload: { date: string; entryId: string; title: string; body: string };
    }
  | { type: 'DELETE_ENTRY'; payload: { date: string; entryId: string } }
  | {
      type: 'MARK_REVIEWED';
      payload: { sourceDate: string; reviewDate: string; completions: Record<string, ReviewCompletion[]> };
    }
  | { type: 'SET_REVIEW_LIMIT'; payload: number };

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_NICKNAME':
      return { ...state, nickname: action.payload };

    case 'LOGOUT':
      return {
        ...state,
        nickname: null,
        dayRecords: {},
        completions: {},
        isLoading: false,
        error: null,
      };

    case 'LOAD_DATA':
      return {
        ...state,
        dayRecords: action.payload.dayRecords,
        completions: action.payload.completions,
        isLoading: false,
        isSyncing: false,
        error: null,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isSyncing: false };

    case 'SELECT_DATE':
      return { ...state, selectedDate: action.payload };

    case 'ADD_ENTRY': {
      const { date, entry } = action.payload;
      const existing = state.dayRecords[date];
      const now = new Date().toISOString();
      const dayRecord: DayRecord = existing
        ? {
            ...existing,
            entries: [...existing.entries, entry],
            updatedAt: now,
          }
        : {
            date,
            entries: [entry],
            updatedAt: now,
          };
      return {
        ...state,
        dayRecords: { ...state.dayRecords, [date]: dayRecord },
      };
    }

    case 'EDIT_ENTRY': {
      const { date, entryId, title, body } = action.payload;
      const record = state.dayRecords[date];
      if (!record) return state;
      return {
        ...state,
        dayRecords: {
          ...state.dayRecords,
          [date]: {
            ...record,
            entries: record.entries.map((e) =>
              e.id === entryId ? { ...e, title, body } : e
            ),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'DELETE_ENTRY': {
      const { date, entryId } = action.payload;
      const record = state.dayRecords[date];
      if (!record) return state;
      const updatedEntries = record.entries.filter((e) => e.id !== entryId);
      return {
        ...state,
        dayRecords: {
          ...state.dayRecords,
          [date]: {
            ...record,
            entries: updatedEntries,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'MARK_REVIEWED':
      return {
        ...state,
        completions: action.payload.completions,
      };

    case 'SET_REVIEW_LIMIT':
      return { ...state, reviewLimit: action.payload };

    default:
      return state;
  }
}
