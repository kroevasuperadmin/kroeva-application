import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useMemo } from "react";

interface StorageState {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const [StorageProvider, useStorage] = createContextHook<StorageState>(() => {
  const getItem = useCallback(async (key: string) => {
    try {
      if (!key || typeof key !== 'string') {
        console.error('Invalid key provided to getItem:', key);
        return null;
      }
      const result = await AsyncStorage.getItem(key);
      return result;
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }, []);

  const setItem = useCallback(async (key: string, value: string) => {
    try {
      if (!key || typeof key !== 'string') {
        console.error('Invalid key provided to setItem:', key);
        return;
      }
      if (typeof value !== 'string') {
        console.error('Invalid value provided to setItem:', value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
    }
  }, []);

  const removeItem = useCallback(async (key: string) => {
    try {
      if (!key || typeof key !== 'string') {
        console.error('Invalid key provided to removeItem:', key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      console.log('Storage cleared successfully');
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }, []);

  return useMemo(() => ({
    getItem,
    setItem,
    removeItem,
    clearAll,
  }), [getItem, setItem, removeItem, clearAll]);
});