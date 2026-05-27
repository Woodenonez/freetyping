import { pinyinDictionary } from './dictionary';

export const PINYIN_CANDIDATE_PAGE_SIZE = 9;

export type CandidatePageState = {
  pageCount: number;
  pageIndex: number;
  pageStartIndex: number;
  visibleCandidates: string[];
};

export function getPinyinCandidates(buffer: string): string[] {
  const normalizedBuffer = buffer.trim().toLowerCase();

  if (normalizedBuffer.length === 0) {
    return [];
  }

  return pinyinDictionary[normalizedBuffer] ?? [];
}

export function getCandidatePageState(
  candidates: string[],
  selectedCandidateIndex: number,
): CandidatePageState {
  if (candidates.length === 0) {
    return {
      pageCount: 0,
      pageIndex: 0,
      pageStartIndex: 0,
      visibleCandidates: [],
    };
  }

  const lastCandidateIndex = candidates.length - 1;
  const safeSelectedCandidateIndex = Math.max(
    0,
    Math.min(selectedCandidateIndex, lastCandidateIndex),
  );
  const pageIndex = Math.floor(
    safeSelectedCandidateIndex / PINYIN_CANDIDATE_PAGE_SIZE,
  );
  const pageStartIndex = pageIndex * PINYIN_CANDIDATE_PAGE_SIZE;

  return {
    pageCount: Math.ceil(candidates.length / PINYIN_CANDIDATE_PAGE_SIZE),
    pageIndex,
    pageStartIndex,
    visibleCandidates: candidates.slice(
      pageStartIndex,
      pageStartIndex + PINYIN_CANDIDATE_PAGE_SIZE,
    ),
  };
}
