import { describe, expect, it } from 'vitest';
import {
  getKeyboardLayout,
  isNordicLayout,
  keyboardLayouts,
  parseKeyboardLayoutId,
} from '.';

describe('keyboard layouts', () => {
  it('keeps QWERTY as the default layout', () => {
    expect(keyboardLayouts[0].id).toBe('qwerty');
    expect(getKeyboardLayout('missing').id).toBe('qwerty');
  });

  it('parses known layout ids', () => {
    expect(parseKeyboardLayoutId('nordic-se-fi')).toBe('nordic-se-fi');
  });

  it('falls back to QWERTY for unknown layout ids', () => {
    expect(parseKeyboardLayoutId('dvorak')).toBe('qwerty');
  });

  it('migrates the old combined Nordic layout to QWERTY', () => {
    expect(parseKeyboardLayoutId('nordic')).toBe('qwerty');
  });

  it('includes merged Swedish and Finnish as one Nordic layout', () => {
    const layout = getKeyboardLayout('nordic-se-fi');

    expect(layout.label).toBe('Nordic (SE/FI)');
    expect(layout.countryCodes).toEqual(['SE', 'FI']);
  });

  it('keeps Norwegian and Danish mappings separate', () => {
    const noSemicolon = getKeyboardLayout('nordic-no')
      .rows.flat()
      .find((key) => key.code === 'Semicolon')?.insertText;
    const dkSemicolon = getKeyboardLayout('nordic-dk')
      .rows.flat()
      .find((key) => key.code === 'Semicolon')?.insertText;

    expect(noSemicolon).toBe('ø');
    expect(dkSemicolon).toBe('æ');
  });

  it('detects Nordic layout ids', () => {
    expect(isNordicLayout('nordic-se-fi')).toBe(true);
    expect(isNordicLayout('qwerty')).toBe(false);
  });
});
