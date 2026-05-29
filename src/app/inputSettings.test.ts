import { describe, expect, it } from 'vitest';
import {
  getMigratedKeyboardLayoutId,
  parseAppInputModeId,
} from './inputSettings';

describe('input settings migration', () => {
  it('keeps only system and overlay input modes', () => {
    expect(parseAppInputModeId('system')).toBe('system');
    expect(parseAppInputModeId('overlay')).toBe('overlay');
  });

  it('migrates old web input modes to overlay', () => {
    expect(parseAppInputModeId('en-direct')).toBe('overlay');
    expect(parseAppInputModeId('zh-pinyin')).toBe('overlay');
    expect(parseAppInputModeId('nordic-direct')).toBe('overlay');
  });

  it('migrates old Pinyin mode to the Pinyin layout', () => {
    expect(getMigratedKeyboardLayoutId('qwerty', 'zh-pinyin')).toBe('pinyin-cn');
  });

  it('migrates old combined Nordic values to QWERTY', () => {
    expect(getMigratedKeyboardLayoutId('nordic', 'nordic-direct')).toBe('qwerty');
  });
});
