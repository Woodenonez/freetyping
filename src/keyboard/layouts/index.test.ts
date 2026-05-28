import { describe, expect, it } from 'vitest';
import { getKeyboardLayout, keyboardLayouts, parseKeyboardLayoutId } from '.';

describe('keyboard layouts', () => {
  it('keeps QWERTY as the default layout', () => {
    expect(keyboardLayouts[0].id).toBe('qwerty');
    expect(getKeyboardLayout('missing').id).toBe('qwerty');
  });

  it('parses known layout ids', () => {
    expect(parseKeyboardLayoutId('nordic')).toBe('nordic');
  });

  it('falls back to QWERTY for unknown layout ids', () => {
    expect(parseKeyboardLayoutId('dvorak')).toBe('qwerty');
  });

  it('includes combined Nordic characters directly on the layout', () => {
    const nordicLabels = getKeyboardLayout('nordic').rows.flat().map((key) => key.label);

    expect(nordicLabels).toEqual(
      expect.arrayContaining(['Å', 'Ä', 'Ö', 'Æ', 'Ø']),
    );
  });
});
