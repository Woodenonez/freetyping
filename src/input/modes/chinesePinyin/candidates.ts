import { pinyinDictionary } from './dictionary';

export function getPinyinCandidates(buffer: string): string[] {
  const normalizedBuffer = buffer.trim().toLowerCase();

  if (normalizedBuffer.length === 0) {
    return [];
  }

  return pinyinDictionary[normalizedBuffer] ?? [];
}
