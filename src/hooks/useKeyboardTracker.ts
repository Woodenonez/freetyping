import { useEffect, useState } from 'react';
import { normalizeKeyboardCode } from '../keyboard/keyNormalize';

export function useKeyboardTracker() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const code = normalizeKeyboardCode(event.code);
      if (code.length === 0) {
        return;
      }

      setActiveKeys((currentKeys) => {
        if (currentKeys.has(code)) {
          return currentKeys;
        }

        const nextKeys = new Set(currentKeys);
        nextKeys.add(code);
        return nextKeys;
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const code = normalizeKeyboardCode(event.code);
      setActiveKeys((currentKeys) => {
        if (!currentKeys.has(code)) {
          return currentKeys;
        }

        const nextKeys = new Set(currentKeys);
        nextKeys.delete(code);
        return nextKeys;
      });
    };

    const handleBlur = () => {
      setActiveKeys(new Set());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return activeKeys;
}
