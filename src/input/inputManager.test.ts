import { describe, expect, it } from 'vitest';
import { getInputMode, inputModes } from './inputManager';

describe('input mode selection', () => {
  it('keeps system input first', () => {
    expect(inputModes[0].id).toBe('system');
  });

  it('returns requested input mode', () => {
    expect(getInputMode('overlay').id).toBe('overlay');
  });

  it('only exposes system and overlay as top-level input modes', () => {
    expect(inputModes.map((mode) => mode.id)).toEqual(['system', 'overlay']);
  });

  it('falls back to system input for unknown modes', () => {
    expect(getInputMode('missing').id).toBe('system');
  });
});
