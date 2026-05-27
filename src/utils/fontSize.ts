export const MIN_FONT_SIZE = 14;
export const MAX_FONT_SIZE = 28;
const DEFAULT_FONT_SIZE = 18;

export function clampFontSize(fontSize: number): number {
  if (!Number.isFinite(fontSize)) {
    return DEFAULT_FONT_SIZE;
  }

  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, fontSize));
}
