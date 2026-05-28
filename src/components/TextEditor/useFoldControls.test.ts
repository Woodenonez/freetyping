import { describe, expect, it } from 'vitest';
import { getFoldTitleDisplayWidth } from './useFoldControls';

describe('getFoldTitleDisplayWidth', () => {
  it('counts ASCII characters as one column', () => {
    expect(getFoldTitleDisplayWidth('# Notes')).toBe(7);
  });

  it('counts Chinese characters as two columns', () => {
    expect(getFoldTitleDisplayWidth('# 标题')).toBe(6);
  });

  it('counts mixed Chinese and English text by display width', () => {
    expect(getFoldTitleDisplayWidth('# A标题B')).toBe(8);
  });
});
