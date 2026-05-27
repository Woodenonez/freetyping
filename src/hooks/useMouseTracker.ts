import { useCallback, useState } from 'react';
import { getMouseButtonId, type MouseButtonId } from '../mouse/types';

export function useMouseTracker() {
  const [activeMouseButtons, setActiveMouseButtons] = useState<
    Set<MouseButtonId>
  >(() => new Set());

  const markMouseButton = useCallback((button: number) => {
    const buttonId = getMouseButtonId(button);
    if (!buttonId) {
      return;
    }

    setActiveMouseButtons((currentButtons) => {
      const nextButtons = new Set(currentButtons);
      nextButtons.add(buttonId);
      return nextButtons;
    });

    window.setTimeout(() => {
      setActiveMouseButtons((currentButtons) => {
        if (!currentButtons.has(buttonId)) {
          return currentButtons;
        }

        const nextButtons = new Set(currentButtons);
        nextButtons.delete(buttonId);
        return nextButtons;
      });
    }, 160);
  }, []);

  return {
    activeMouseButtons,
    markMouseButton,
  };
}
