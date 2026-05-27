import { describe, expect, it } from 'vitest';
import { normalizeKeyboardCode } from './keyNormalize';

describe('normalizeKeyboardCode', () => {
  it('trims keyboard code values', () => {
    expect(normalizeKeyboardCode(' KeyA ')).toBe('KeyA');
  });

  it('keeps empty values empty', () => {
    expect(normalizeKeyboardCode('   ')).toBe('');
  });
});
