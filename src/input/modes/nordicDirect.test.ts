// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { nordicDirectInputMode } from './nordicDirect';

describe('Nordic Direct input mode', () => {
  it('maps physical key codes to Nordic characters', () => {
    const result = nordicDirectInputMode.onKeyDown?.(
      new KeyboardEvent('keydown', { code: 'BracketLeft', key: '[' }),
      {
        text: '',
        selectionStart: 0,
        selectionEnd: 0,
        isComposing: false,
      },
    );

    expect(result).toMatchObject({
      handled: true,
      insertText: 'å',
      preventDefault: true,
    });
  });

  it('uppercases single-character input when Shift is pressed', () => {
    const result = nordicDirectInputMode.onKeyDown?.(
      new KeyboardEvent('keydown', {
        code: 'BracketRight',
        key: '{',
        shiftKey: true,
      }),
      {
        text: '',
        selectionStart: 0,
        selectionEnd: 0,
        isComposing: false,
      },
    );

    expect(result?.insertText).toBe('Ä');
  });

  it('does not capture shortcut chords', () => {
    const result = nordicDirectInputMode.onKeyDown?.(
      new KeyboardEvent('keydown', {
        code: 'KeyA',
        key: 'a',
        ctrlKey: true,
      }),
      {
        text: '',
        selectionStart: 0,
        selectionEnd: 0,
        isComposing: false,
      },
    );

    expect(result).toBeNull();
  });
});
