import {
  pinyinDictionaryEntries,
  type PinyinDictionaryEntry,
} from './dictionary';

export const PINYIN_CANDIDATE_PAGE_SIZE = 9;

const MAX_SEGMENT_PATHS = 24;
const MAX_SEGMENT_ENTRY_VARIANTS = 2;

export type CandidatePageState = {
  pageCount: number;
  pageIndex: number;
  pageStartIndex: number;
  visibleCandidates: string[];
};

export type PinyinCandidateOptions = {
  fuzzyMatching?: boolean;
};

type RankedCandidate = {
  exact: boolean;
  score: number;
  text: string;
};

const entriesByKey = pinyinDictionaryEntries.reduce(
  (entryMap, entry) => {
    const entries = entryMap.get(entry.key) ?? [];
    entries.push(entry);
    entryMap.set(entry.key, entries);
    return entryMap;
  },
  new Map<string, PinyinDictionaryEntry[]>(),
);

for (const entries of entriesByKey.values()) {
  entries.sort(
    (firstEntry, secondEntry) => secondEntry.frequency - firstEntry.frequency,
  );
}

const dictionaryKeys = [...entriesByKey.keys()].sort(
  (firstKey, secondKey) => secondKey.length - firstKey.length,
);

function normalizeBuffer(buffer: string): string {
  return buffer.trim().toLowerCase();
}

function addFuzzyVariants(value: string, variants: Set<string>): void {
  const pairs = [
    ['zh', 'z'],
    ['ch', 'c'],
    ['sh', 's'],
    ['n', 'l'],
  ] as const;

  let expanded = true;

  while (expanded && variants.size < 64) {
    expanded = false;

    for (const variant of [...variants]) {
      for (const [longValue, shortValue] of pairs) {
        const fromLong = variant.replaceAll(longValue, shortValue);
        const fromShort = variant.replaceAll(shortValue, longValue);

        if (!variants.has(fromLong)) {
          variants.add(fromLong);
          expanded = true;
        }

        if (!variants.has(fromShort)) {
          variants.add(fromShort);
          expanded = true;
        }
      }
    }
  }

  variants.add(value);
}

function getLookupKeys(
  buffer: string,
  options: PinyinCandidateOptions,
): string[] {
  const variants = new Set([buffer]);

  if (options.fuzzyMatching) {
    addFuzzyVariants(buffer, variants);
  }

  return [...variants];
}

function scoreExactEntry(
  entry: PinyinDictionaryEntry,
  isOriginalKey: boolean,
): number {
  const exactKeyBonus = isOriginalKey ? 20_000 : 12_000;
  const phraseBonus = entry.phraseLength > 1 ? entry.phraseLength * 1000 : 0;

  return exactKeyBonus + phraseBonus + entry.frequency;
}

function scoreSegmentPath(path: PinyinDictionaryEntry[]): number {
  const frequencyScore = path.reduce(
    (total, entry) => total + entry.frequency,
    0,
  );
  const phraseLengthScore = path.reduce(
    (total, entry) => total + entry.phraseLength * 100,
    0,
  );

  return frequencyScore + phraseLengthScore - path.length * 50;
}

function segmentKey(key: string): PinyinDictionaryEntry[][] {
  const pathsByOffset = new Map<number, PinyinDictionaryEntry[][]>();

  function visit(offset: number): PinyinDictionaryEntry[][] {
    const cachedPaths = pathsByOffset.get(offset);

    if (cachedPaths) {
      return cachedPaths;
    }

    if (offset === key.length) {
      return [[]];
    }

    const paths: PinyinDictionaryEntry[][] = [];

    for (const dictionaryKey of dictionaryKeys) {
      if (!key.startsWith(dictionaryKey, offset)) {
        continue;
      }

      const entries =
        entriesByKey
          .get(dictionaryKey)
          ?.slice(0, MAX_SEGMENT_ENTRY_VARIANTS) ?? [];
      const nextPaths = visit(offset + dictionaryKey.length);

      for (const entry of entries) {
        for (const nextPath of nextPaths) {
          paths.push([entry, ...nextPath]);

          if (paths.length >= MAX_SEGMENT_PATHS) {
            pathsByOffset.set(offset, paths);
            return paths;
          }
        }
      }
    }

    pathsByOffset.set(offset, paths);
    return paths;
  }

  return visit(0).filter((path) => path.length > 1);
}

function mergeCandidate(
  candidateMap: Map<string, RankedCandidate>,
  candidate: RankedCandidate,
): void {
  const currentCandidate = candidateMap.get(candidate.text);

  if (!currentCandidate || candidate.score > currentCandidate.score) {
    candidateMap.set(candidate.text, candidate);
  }
}

export function getPinyinCandidates(
  buffer: string,
  options: PinyinCandidateOptions = {},
): string[] {
  const normalizedBuffer = normalizeBuffer(buffer);

  if (normalizedBuffer.length === 0) {
    return [];
  }

  const candidateMap = new Map<string, RankedCandidate>();

  for (const lookupKey of getLookupKeys(normalizedBuffer, options)) {
    const isOriginalKey = lookupKey === normalizedBuffer;
    const exactEntries = entriesByKey.get(lookupKey) ?? [];

    for (const entry of exactEntries) {
      mergeCandidate(candidateMap, {
        exact: true,
        score: scoreExactEntry(entry, isOriginalKey),
        text: entry.text,
      });
    }

    for (const path of segmentKey(lookupKey)) {
      mergeCandidate(candidateMap, {
        exact: false,
        score: scoreSegmentPath(path),
        text: path.map((entry) => entry.text).join(''),
      });
    }
  }

  return [...candidateMap.values()]
    .sort((firstCandidate, secondCandidate) => {
      if (firstCandidate.exact !== secondCandidate.exact) {
        return firstCandidate.exact ? -1 : 1;
      }

      return secondCandidate.score - firstCandidate.score;
    })
    .map((candidate) => candidate.text);
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
