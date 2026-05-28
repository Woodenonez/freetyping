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

  it('ranks exact multi-syllable phrases before segmented candidates', () => {
    expect(getPinyinCandidates('xianshi').slice(0, 3)).toEqual([
      '显示',
      '现实',
      '限时',
    ]);
  });

  it('segments continuous Pinyin when no exact phrase exists', () => {
    expect(getPinyinCandidates('womende').at(0)).toBe('我们的');
  });

  it('can use zh/ch/sh fuzzy matching', () => {
    expect(getPinyinCandidates('si', { fuzzyMatching: true })).toContain('是');
  });

  it('can use n/l fuzzy matching', () => {
    expect(getPinyinCandidates('li', { fuzzyMatching: true })).toContain('你');
  });

  it('does not use fuzzy matching unless enabled', () => {
    expect(getPinyinCandidates('si')).not.toContain('是');
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
