import { describe, expect, it } from 'vitest';
import { parsePanelAppearance, parsePanelSkin } from './panelAppearance';

describe('panel appearance settings', () => {
  it('accepts known appearance values', () => {
    expect(parsePanelAppearance('realistic')).toBe('realistic');
  });

  it('falls back to simple for unknown appearance values', () => {
    expect(parsePanelAppearance('cinematic')).toBe('simple');
  });

  it('accepts known skin values', () => {
    expect(parsePanelSkin('dark-mechanical')).toBe('dark-mechanical');
    expect(parsePanelSkin('natural-wood')).toBe('natural-wood');
  });

  it('falls back to classic light for unknown skin values', () => {
    expect(parsePanelSkin('neon')).toBe('classic-light');
  });
});
