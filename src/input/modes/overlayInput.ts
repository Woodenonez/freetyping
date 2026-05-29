import type { KeyboardLayout } from '../../keyboard/types';
import type { InputMode } from '../types';

export const overlayInputMode: InputMode = {
  id: 'overlay',
  label: 'Overlay Input',
  description: 'Use the selected panel layout for app-controlled input.',
};

export function getLayoutInputText(
  event: KeyboardEvent,
  layout: KeyboardLayout,
): string | null {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return null;
  }

  const key = layout.rows.flat().find((layoutKey) => layoutKey.code === event.code);

  if (typeof key?.insertText !== 'string') {
    return null;
  }

  if (event.shiftKey && typeof key.shiftedText === 'string') {
    return key.shiftedText;
  }

  if (event.shiftKey && key.insertText.length === 1) {
    return key.insertText.toLocaleUpperCase();
  }

  return key.insertText;
}

export function createLayoutOverlayInputMode(layout: KeyboardLayout): InputMode {
  return {
    ...overlayInputMode,
    label: `Overlay Input · ${layout.label}`,
    onKeyDown(event) {
      const inputText = getLayoutInputText(event, layout);

      if (inputText === null) {
        return null;
      }

      return {
        handled: true,
        insertText: inputText,
        preventDefault: true,
      };
    },
  };
}
