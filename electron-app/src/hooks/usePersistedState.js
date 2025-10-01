import { useState, useEffect, useRef, useCallback } from 'react';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electron;

/**
 * Custom hook for persisting state to electron-store
 * @param {string} key - The key to store the value under
 * @param {*} defaultValue - The default value if nothing is stored
 * @param {number} debounceMs - Milliseconds to debounce saves (default: 1000)
 * @returns {[value, setValue, { isLoading, lastSaved, clearValue }]}
 */
export function usePersistedState(key, defaultValue, debounceMs = 1000) {
  const [state, setState] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  // Load initial value from store
  useEffect(() => {
    if (!isElectron) {
      setIsLoading(false);
      return;
    }

    const loadValue = async () => {
      try {
        const storedValue = await window.electron.store.get(key, defaultValue);
        setState(storedValue);
        setIsLoading(false);
      } catch (error) {
        console.error(`Error loading persisted state for key "${key}":`, error);
        setState(defaultValue);
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]); // Only run on mount or key change

  // Save to store with debounce
  useEffect(() => {
    // Skip initial mount to avoid unnecessary save
    if (isInitialMount.current || isLoading) {
      isInitialMount.current = false;
      return;
    }

    if (!isElectron) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after debounce period
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Convert Set to Array for JSON serialization
        const valueToSave = state instanceof Set ? Array.from(state) : state;
        await window.electron.store.set(key, valueToSave);
        setLastSaved(new Date());
      } catch (error) {
        console.error(`Error saving persisted state for key "${key}":`, error);
      }
    }, debounceMs);

    // Cleanup on unmount or state change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, key, debounceMs, isLoading]);

  // Force immediate save
  const forceSave = useCallback(async () => {
    if (!isElectron) return;
    
    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    try {
      // Convert Set to Array for JSON serialization
      const valueToSave = state instanceof Set ? Array.from(state) : state;
      await window.electron.store.set(key, valueToSave);
      setLastSaved(new Date());
    } catch (error) {
      console.error(`Error force saving persisted state for key "${key}":`, error);
    }
  }, [key, state]);

  // Clear value from store
  const clearValue = useCallback(async () => {
    if (!isElectron) return;

    try {
      await window.electron.store.delete(key);
      setState(defaultValue);
      setLastSaved(null);
    } catch (error) {
      console.error(`Error clearing persisted state for key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [
    state,
    setState,
    {
      isLoading,
      lastSaved,
      clearValue,
      forceSave,
    },
  ];
}

/**
 * Hook to manage multiple persisted states and provide a unified last saved timestamp
 * @returns {{ lastSaved, updateLastSaved, clearAllData }}
 */
export function usePersistenceManager() {
  const [lastSaved, setLastSaved] = useState(null);

  const updateLastSaved = useCallback(() => {
    setLastSaved(new Date());
  }, []);

  const clearAllData = useCallback(async () => {
    if (!isElectron) return false;

    const confirmed = window.confirm(
      'Are you sure you want to clear all data? This action cannot be undone.'
    );

    if (!confirmed) return false;

    try {
      await window.electron.store.clear();
      setLastSaved(null);
      
      // Show notification
      if (window.electron?.sendNotification) {
        await window.electron.sendNotification({
          title: '🗑️ All Data Cleared',
          body: 'All dashboard data has been permanently deleted.',
        });
      }
      
      // Reload the page to reset all state
      window.location.reload();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      alert('Failed to clear data. Please try again.');
      return false;
    }
  }, []);

  return {
    lastSaved,
    updateLastSaved,
    clearAllData,
  };
}
