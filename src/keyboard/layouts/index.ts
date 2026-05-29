import {
  nordicDkLayout,
  nordicNoLayout,
  nordicSeFiLayout,
} from './nordic';
import { pinyinCnLayout } from './pinyinCn';
import { qwertyLayout } from './qwerty';

export type KeyboardLayoutId =
  | 'qwerty'
  | 'pinyin-cn'
  | 'nordic-se-fi'
  | 'nordic-no'
  | 'nordic-dk';

export const keyboardLayouts = [
  qwertyLayout,
  pinyinCnLayout,
  nordicSeFiLayout,
  nordicNoLayout,
  nordicDkLayout,
] as const;

export const generalKeyboardLayouts = [qwertyLayout, pinyinCnLayout] as const;

export const nordicKeyboardLayouts = [
  nordicSeFiLayout,
  nordicNoLayout,
  nordicDkLayout,
] as const;

export function isPinyinLayout(layoutId: KeyboardLayoutId): boolean {
  return layoutId === 'pinyin-cn';
}

export function isNordicLayout(layoutId: KeyboardLayoutId): boolean {
  return layoutId.startsWith('nordic-');
}

export function getKeyboardLayout(layoutId: string) {
  return keyboardLayouts.find((layout) => layout.id === layoutId) ?? qwertyLayout;
}

export function parseKeyboardLayoutId(value: unknown): KeyboardLayoutId {
  if (value === 'nordic') {
    return 'qwerty';
  }

  return keyboardLayouts.some((layout) => layout.id === value)
    ? (value as KeyboardLayoutId)
    : 'qwerty';
}
