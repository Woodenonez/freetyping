// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { parseStoredValue, readLocalStorageValue } from './useLocalStorageState';

describe('local storage state helpers', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
      },
    });
  });

  it('parses valid stored JSON', () => {
    expect(parseStoredValue('true', false)).toBe(true);
  });

  it('falls back for missing values', () => {
    expect(parseStoredValue(null, 'fallback')).toBe('fallback');
  });

  it('falls back for invalid JSON', () => {
    expect(parseStoredValue('{bad json', 12)).toBe(12);
  });

  it('reads localStorage values', () => {
    window.localStorage.setItem('setting', JSON.stringify('saved'));

    expect(readLocalStorageValue('setting', 'fallback')).toBe('saved');
  });
});
