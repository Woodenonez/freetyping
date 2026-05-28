import { nordicLayout } from './nordic';
import { qwertyLayout } from './qwerty';

export type KeyboardLayoutId = 'qwerty' | 'nordic';

export const keyboardLayouts = [qwertyLayout, nordicLayout] as const;

export function getKeyboardLayout(layoutId: string) {
  return keyboardLayouts.find((layout) => layout.id === layoutId) ?? qwertyLayout;
}

export function parseKeyboardLayoutId(value: unknown): KeyboardLayoutId {
  return keyboardLayouts.some((layout) => layout.id === value)
    ? (value as KeyboardLayoutId)
    : 'qwerty';
}
