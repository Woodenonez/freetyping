import { describe, expect, it } from 'vitest';
import { getInputMode, inputModes } from './inputManager';

describe('input mode selection', () => {
  it('keeps system input first', () => {
    expect(inputModes[0].id).toBe('system');
  });

  it('returns requested input mode', () => {
    expect(getInputMode('zh-pinyin').id).toBe('zh-pinyin');
  });

  it('includes Nordic Direct as a web input mode', () => {
    expect(inputModes.map((mode) => mode.id)).toContain('nordic-direct');
  });

  it('falls back to system input for unknown modes', () => {
    expect(getInputMode('missing').id).toBe('system');
  });
});
