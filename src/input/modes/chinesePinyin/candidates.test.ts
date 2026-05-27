import { describe, expect, it } from 'vitest';
import {
  PINYIN_CANDIDATE_PAGE_SIZE,
  getCandidatePageState,
  getPinyinCandidates,
} from './candidates';

describe('getPinyinCandidates', () => {
  it('looks up normalized dictionary entries', () => {
    expect(getPinyinCandidates(' SHI ').at(0)).toBe('是');
  });
});

describe('getCandidatePageState', () => {
  const candidates = Array.from(
    { length: PINYIN_CANDIDATE_PAGE_SIZE + 3 },
    (_, index) => `c${index}`,
  );

  it('returns the first page for an early selection', () => {
    expect(getCandidatePageState(candidates, 0)).toEqual({
      pageCount: 2,
      pageIndex: 0,
      pageStartIndex: 0,
      visibleCandidates: candidates.slice(0, PINYIN_CANDIDATE_PAGE_SIZE),
    });
  });

  it('moves to the page containing the selected candidate', () => {
    expect(
      getCandidatePageState(candidates, PINYIN_CANDIDATE_PAGE_SIZE),
    ).toEqual({
      pageCount: 2,
      pageIndex: 1,
      pageStartIndex: PINYIN_CANDIDATE_PAGE_SIZE,
      visibleCandidates: candidates.slice(PINYIN_CANDIDATE_PAGE_SIZE),
    });
  });
});
