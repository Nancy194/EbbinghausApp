import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { loginOrRegister, fetchData, syncData } from '../services/api';
import type { AppState } from '../types';
import type { Action } from './appReducer';

export function useAppPersistence(
  state: AppState,
  dispatch: React.Dispatch<Action>
) {
  const isInitialized = useRef(false);
  const prevNickname = useRef(state.nickname);

  // 启动时：如果有 nickname，从服务端拉取数据
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    (async () => {
      try {
        const savedNickname = await AsyncStorage.getItem(STORAGE_KEYS.NICKNAME);
        if (!savedNickname) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        dispatch({ type: 'SET_NICKNAME', payload: savedNickname });

        try {
          const data = await fetchData(savedNickname);
          dispatch({ type: 'LOAD_DATA', payload: data });
          // 更新本地缓存
          await AsyncStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(data.dayRecords));
          await AsyncStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(data.completions));
        } catch {
          // 网络失败 → 使用本地缓存
          const dayRecordsJson = await AsyncStorage.getItem(STORAGE_KEYS.DAY_RECORDS);
          const completionsJson = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETIONS);
          dispatch({
            type: 'LOAD_DATA',
            payload: {
              dayRecords: dayRecordsJson ? JSON.parse(dayRecordsJson) : {},
              completions: completionsJson ? JSON.parse(completionsJson) : {},
            },
          });
        }
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: err.message ?? '加载失败' });
      }
    })();
  }, []);

  // 监听 nickname 变化：登录时同步数据
  useEffect(() => {
    if (prevNickname.current === state.nickname) return;
    prevNickname.current = state.nickname;

    if (!state.nickname) return;

    (async () => {
      try {
        await loginOrRegister(state.nickname!);
        const data = await fetchData(state.nickname!);
        dispatch({ type: 'LOAD_DATA', payload: data });
        await AsyncStorage.setItem(STORAGE_KEYS.NICKNAME, state.nickname!);
        await AsyncStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(data.dayRecords));
        await AsyncStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(data.completions));
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: err.message ?? '同步失败' });
      }
    })();
  }, [state.nickname]);

  // 写操作后：同步到服务端
  const prevDayRecords = useRef(state.dayRecords);
  const prevCompletions = useRef(state.completions);
  const isFirstDataSync = useRef(true);

  useEffect(() => {
    if (!state.nickname) return;
    // 跳过首次装载（数据刚从服务端拉到本地）
    if (isFirstDataSync.current) {
      isFirstDataSync.current = false;
      return;
    }
    if (
      prevDayRecords.current === state.dayRecords &&
      prevCompletions.current === state.completions
    ) return;

    prevDayRecords.current = state.dayRecords;
    prevCompletions.current = state.completions;

    dispatch({ type: 'SET_SYNCING', payload: true });

    (async () => {
      try {
        await syncData(state.nickname!, {
          dayRecords: state.dayRecords,
          completions: state.completions,
        });
        // 更新本地缓存
        await AsyncStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(state.dayRecords));
        await AsyncStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(state.completions));
        dispatch({ type: 'SET_SYNCING', payload: false });
      } catch {
        // 同步失败：本地数据已保存，下次启动时会重新拉取
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
    })();
  }, [state.dayRecords, state.completions, state.nickname]);
}
