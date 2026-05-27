import { describe, expect, it } from 'vitest';
import { clampFontSize } from './fontSize';

describe('clampFontSize', () => {
  it('keeps values within range', () => {
    expect(clampFontSize(20)).toBe(20);
  });

  it('clamps values outside range', () => {
    expect(clampFontSize(8)).toBe(14);
    expect(clampFontSize(40)).toBe(28);
  });

  it('falls back for invalid values', () => {
    expect(clampFontSize(Number.NaN)).toBe(18);
  });
});
