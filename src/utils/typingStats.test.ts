import { describe, expect, it } from 'vitest';
import { calculateTypingStats } from './typingStats';

describe('calculateTypingStats', () => {
  it('counts characters and words', () => {
    expect(calculateTypingStats('hello world', 60)).toEqual({
      characterCount: 11,
      wordCount: 2,
      sessionSeconds: 60,
      wordsPerMinute: 2,
    });
  });

  it('handles empty text', () => {
    expect(calculateTypingStats('', 10)).toEqual({
      characterCount: 0,
      wordCount: 0,
      sessionSeconds: 10,
      wordsPerMinute: 0,
    });
  });
});
