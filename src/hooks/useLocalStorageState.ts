import { useCallback, useEffect, useState } from 'react';

type SetValue<T> = T | ((currentValue: T) => T);

export function parseStoredValue<T>(storedValue: string | null, fallback: T): T {
  if (storedValue === null) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

export function readLocalStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return parseStoredValue(window.localStorage.getItem(key), fallback);
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void] {
  const [state, setState] = useState<T>(() =>
    readLocalStorageValue(key, initialValue),
  );

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  const setStoredState = useCallback((value: SetValue<T>) => {
    setState((currentValue) =>
      typeof value === 'function'
        ? (value as (currentValue: T) => T)(currentValue)
        : value,
    );
  }, []);

  return [state, setStoredState];
}
