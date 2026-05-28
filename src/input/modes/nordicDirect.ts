import type { InputMode } from '../types';
import { nordicLayout } from '../../keyboard/layouts/nordic';

const nordicTextByCode = new Map(
  nordicLayout.rows
    .flat()
    .filter((key) => typeof key.insertText === 'string')
    .map((key) => [key.code, key.insertText ?? '']),
);

function getNordicInputText(event: KeyboardEvent): string | null {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return null;
  }

  const inputText = nordicTextByCode.get(event.code);

  if (typeof inputText !== 'string') {
    return null;
  }

  if (event.shiftKey && inputText.length === 1) {
    return inputText.toLocaleUpperCase();
  }

  return inputText;
}

export const nordicDirectInputMode: InputMode = {
  id: 'nordic-direct',
  label: 'Nordic Direct',
  language: 'sv',
  description: 'Direct Nordic typing with the combined Nordic virtual keyboard.',
  onKeyDown(event) {
    const inputText = getNordicInputText(event);

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
