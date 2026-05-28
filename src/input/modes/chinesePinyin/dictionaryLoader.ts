import { installGeneratedPinyinDictionary } from './candidates';
import type { PinyinGeneratedDictionary } from './dictionary';

export type PinyinDictionaryLoadResult = {
  entryCount: number;
  keyCount: number;
  license: string;
  source: string;
};

let loadPromise: Promise<PinyinDictionaryLoadResult> | null = null;

export function loadGeneratedPinyinDictionary(): Promise<PinyinDictionaryLoadResult> {
  if (loadPromise) {
    return loadPromise;
  }

  const dictionaryUrl = `${import.meta.env.BASE_URL}data/pinyin-dictionary.json`;

  loadPromise = fetch(dictionaryUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load Pinyin dictionary: ${response.status}`);
      }

      return response.json() as Promise<PinyinGeneratedDictionary>;
    })
    .then((dictionary) => {
      installGeneratedPinyinDictionary(dictionary);

      return {
        entryCount: dictionary.entryCount,
        keyCount: dictionary.keyCount,
        license: dictionary.license,
        source: dictionary.source,
      };
    });

  return loadPromise;
}
