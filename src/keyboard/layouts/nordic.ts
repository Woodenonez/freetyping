import type { KeyboardLayout, VirtualKey } from '../types';
import { qwertyLayout } from './qwerty';

function replaceKeys(
  layout: KeyboardLayout,
  replacements: Record<string, Partial<VirtualKey>>,
): VirtualKey[][] {
  return layout.rows.map((row) =>
    row.map((key) => ({
      ...key,
      ...(replacements[key.code] ?? {}),
    })),
  );
}

const baseNordicReplacements: Record<string, Partial<VirtualKey>> = {
  Digit1: { shiftedText: '!' },
  Digit2: { shiftedText: '"' },
  Digit3: { shiftedText: '#' },
  Digit4: { shiftedText: '¤' },
  Digit5: { shiftedText: '%' },
  Digit6: { shiftedText: '&' },
  Digit7: { insertText: '7', shiftedText: '/' },
  Digit8: { insertText: '8', shiftedText: '(' },
  Digit9: { insertText: '9', shiftedText: ')' },
  Digit0: { insertText: '0', shiftedText: '=' },
  Minus: { label: '+', insertText: '+', shiftedText: '?' },
  Equal: { label: '´', insertText: '´', shiftedText: '`' },
  BracketLeft: { label: 'Å', insertText: 'å', shiftedText: 'Å' },
  BracketRight: { label: '¨', insertText: '¨', shiftedText: '^' },
  Backslash: { label: "'", insertText: "'", shiftedText: '*' },
  Comma: { insertText: ',', shiftedText: ';' },
  Period: { insertText: '.', shiftedText: ':' },
  Slash: { label: '-', insertText: '-', shiftedText: '_' },
};

// Swedish and Finnish standard PC layouts share the same letter placement.
export const nordicSeFiLayout: KeyboardLayout = {
  id: 'nordic-se-fi',
  label: 'Nordic (SE/FI)',
  countryCodes: ['SE', 'FI'],
  rows: replaceKeys(qwertyLayout, {
    ...baseNordicReplacements,
    Backquote: { label: '½', insertText: '½', shiftedText: '§' },
    Semicolon: { label: 'Ö', insertText: 'ö', shiftedText: 'Ö' },
    Quote: { label: 'Ä', insertText: 'ä', shiftedText: 'Ä' },
  }),
};

export const nordicNoLayout: KeyboardLayout = {
  id: 'nordic-no',
  label: 'Nordic (NO)',
  countryCodes: ['NO'],
  rows: replaceKeys(qwertyLayout, {
    ...baseNordicReplacements,
    Backquote: { label: '§', insertText: '§', shiftedText: '|' },
    Semicolon: { label: 'Ø', insertText: 'ø', shiftedText: 'Ø' },
    Quote: { label: 'Æ', insertText: 'æ', shiftedText: 'Æ' },
  }),
};

export const nordicDkLayout: KeyboardLayout = {
  id: 'nordic-dk',
  label: 'Nordic (DK)',
  countryCodes: ['DK'],
  rows: replaceKeys(qwertyLayout, {
    ...baseNordicReplacements,
    Backquote: { label: '§', insertText: '§', shiftedText: '½' },
    Backslash: { label: '\\', insertText: '\\', shiftedText: '|' },
    Semicolon: { label: 'Æ', insertText: 'æ', shiftedText: 'Æ' },
    Quote: { label: 'Ø', insertText: 'ø', shiftedText: 'Ø' },
  }),
};
