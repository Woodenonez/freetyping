// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { getKeyboardLayout } from '../../keyboard/layouts';
import { createLayoutOverlayInputMode } from './overlayInput';

describe('layout overlay input', () => {
  it('maps physical key codes through the selected Nordic layout', () => {
    const mode = createLayoutOverlayInputMode(getKeyboardLayout('nordic-se-fi'));
    const result = mode.onKeyDown?.(
      new KeyboardEvent('keydown', { code: 'Semicolon', key: ';' }),
      {
        text: '',
        selectionStart: 0,
        selectionEnd: 0,
        isComposing: false,
      },
    );

    expect(result).toMatchObject({
      handled: true,
      insertText: 'ö',
      preventDefault: true,
    });
  });

  it('uses explicit shifted symbol mappings', () => {
    const mode = createLayoutOverlayInputMode(getKeyboardLayout('nordic-se-fi'));
    const result = mode.onKeyDown?.(
      new KeyboardEvent('keydown', {
        code: 'Digit2',
        key: '"',
        shiftKey: true,
      }),
      {
        text: '',
        selectionStart: 0,
        selectionEnd: 0,
        isComposing: false,
      },
    );

    expect(result?.insertText).toBe('"');
  });

  it('uses different mappings for different Nordic layouts', () => {
    const noMode = createLayoutOverlayInputMode(getKeyboardLayout('nordic-no'));
    const dkMode = createLayoutOverlayInputMode(getKeyboardLayout('nordic-dk'));
    const context = {
      text: '',
      selectionStart: 0,
      selectionEnd: 0,
      isComposing: false,
    };

    expect(
      noMode.onKeyDown?.(
        new KeyboardEvent('keydown', { code: 'Semicolon', key: ';' }),
        context,
      )?.insertText,
    ).toBe('ø');
    expect(
      dkMode.onKeyDown?.(
        new KeyboardEvent('keydown', { code: 'Semicolon', key: ';' }),
        context,
      )?.insertText,
    ).toBe('æ');
  });

  it('does not capture shortcut chords', () => {
    const mode = createLayoutOverlayInputMode(getKeyboardLayout('qwerty'));
    const result = mode.onKeyDown?.(
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
