export type TypingStats = {
  characterCount: number;
  wordCount: number;
  sessionSeconds: number;
  wordsPerMinute: number;
};

export function calculateTypingStats(
  text: string,
  sessionSeconds: number,
): TypingStats {
  const trimmedText = text.trim();
  const wordCount = trimmedText.length === 0 ? 0 : trimmedText.split(/\s+/).length;
  const minutes = Math.max(sessionSeconds / 60, 1 / 60);

  return {
    characterCount: text.length,
    wordCount,
    sessionSeconds,
    wordsPerMinute: Math.round(wordCount / minutes),
  };
}
