import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppState, Entry, ReviewCompletion } from '../types';
import { REVIEW_DEFAULT_LIMIT, STORAGE_KEYS } from '../constants';
import { getToday } from '../utils/dateUtils';
import { markReviewComplete as calcMarkReviewComplete } from '../utils/reviewAlgorithm';
import { appReducer } from './appReducer';
import { useAppPersistence } from './useAppPersistence';
import type { Action } from './appReducer';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  login: (nickname: string) => void;
  logout: () => void;
  setReviewLimit: (limit: number) => void;
  addEntry: (date: string, entry: Entry, resetReview?: boolean) => void;
  editEntry: (date: string, entryId: string, title: string, body: string) => void;
  deleteEntry: (date: string, entryId: string) => void;
  markReviewComplete: (sourceDate: string) => void;
  selectDate: (date: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const today = getToday();

const initialState: AppState = {
  nickname: null,
  dayRecords: {},
  completions: {},
  selectedDate: today,
  today,
  isLoading: true,
  error: null,
  isSyncing: false,
  reviewLimit: REVIEW_DEFAULT_LIMIT,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useAppPersistence(state, dispatch);

  // 启动时恢复 reviewLimit
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_LIMIT);
      if (saved) {
        const limit = parseInt(saved, 10);
        if (limit >= 1 && limit <= 50) {
          dispatch({ type: 'SET_REVIEW_LIMIT', payload: limit });
        }
      }
    })();
  }, []);

  const login = (nickname: string) => {
    dispatch({ type: 'SET_NICKNAME', payload: nickname });
  };

  const logout = () => {
    AsyncStorage.removeItem(STORAGE_KEYS.NICKNAME);
    dispatch({ type: 'LOGOUT' });
  };

  const setReviewLimit = (limit: number) => {
    dispatch({ type: 'SET_REVIEW_LIMIT', payload: limit });
    AsyncStorage.setItem(STORAGE_KEYS.REVIEW_LIMIT, String(limit));
  };

  const addEntry = (date: string, entry: Entry, resetReview?: boolean) => {
    dispatch({ type: 'ADD_ENTRY', payload: { date, entry, resetReview } });
  };

  const editEntry = (date: string, entryId: string, title: string, body: string) => {
    dispatch({ type: 'EDIT_ENTRY', payload: { date, entryId, title, body } });
  };

  const deleteEntry = (date: string, entryId: string) => {
    dispatch({ type: 'DELETE_ENTRY', payload: { date, entryId } });
  };

  const markReviewComplete = (sourceDate: string) => {
    const newCompletions = calcMarkReviewComplete(
      sourceDate,
      state.today,
      state.completions
    );
    dispatch({
      type: 'MARK_REVIEWED',
      payload: { sourceDate, reviewDate: state.today, completions: newCompletions },
    });
  };

  const selectDate = (date: string) => {
    dispatch({ type: 'SELECT_DATE', payload: date });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        setReviewLimit,
        addEntry,
        editEntry,
        deleteEntry,
        markReviewComplete,
        selectDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return ctx;
}
