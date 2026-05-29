import type { KeyboardLayoutId } from '../keyboard/layouts';
import { parseKeyboardLayoutId } from '../keyboard/layouts';

export type AppInputModeId = 'system' | 'overlay';

export function parseAppInputModeId(value: unknown): AppInputModeId {
  if (
    value === 'overlay' ||
    value === 'en-direct' ||
    value === 'zh-pinyin' ||
    value === 'nordic-direct'
  ) {
    return 'overlay';
  }

  return 'system';
}

export function getMigratedKeyboardLayoutId(
  layoutValue: unknown,
  inputModeValue: unknown,
): KeyboardLayoutId {
  const parsedLayoutId = parseKeyboardLayoutId(layoutValue);

  if (inputModeValue === 'zh-pinyin') {
    return 'pinyin-cn';
  }

  if (layoutValue === 'nordic' || inputModeValue === 'nordic-direct') {
    return 'qwerty';
  }

  return parsedLayoutId;
}
