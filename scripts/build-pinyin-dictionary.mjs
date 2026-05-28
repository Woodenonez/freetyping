import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const sourceUrl =
  'https://raw.githubusercontent.com/rime/rime-pinyin-simp/master/pinyin_simp.dict.yaml';
const outputPath = 'public/data/pinyin-dictionary.json';

function normalizePinyinKey(rawKey) {
  return rawKey.replaceAll(' ', '').replaceAll('ü', 'v').toLowerCase();
}

function parseDictionary(sourceText) {
  const entriesByKey = new Map();
  let inDictionaryBody = false;

  for (const line of sourceText.split('\n')) {
    const trimmedLine = line.trim();

    if (trimmedLine === '...') {
      inDictionaryBody = true;
      continue;
    }

    if (!inDictionaryBody || trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
      continue;
    }

    const [text, rawKey, rawFrequency = '0'] = line.split('\t');

    if (!text || !rawKey) {
      continue;
    }

    const key = normalizePinyinKey(rawKey);
    const frequency = Number.parseInt(rawFrequency, 10);

    if (!key || !Number.isFinite(frequency)) {
      continue;
    }

    const entries = entriesByKey.get(key) ?? [];
    entries.push([text, frequency]);
    entriesByKey.set(key, entries);
  }

  return Object.fromEntries(
    [...entriesByKey.entries()]
      .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
      .map(([key, entries]) => [
        key,
        entries.sort((firstEntry, secondEntry) => secondEntry[1] - firstEntry[1]),
      ]),
  );
}

const response = await fetch(sourceUrl);

if (!response.ok) {
  throw new Error(`Could not fetch ${sourceUrl}: ${response.status}`);
}

const sourceText = await response.text();
const dictionary = parseDictionary(sourceText);
const keyCount = Object.keys(dictionary).length;
const entryCount = Object.values(dictionary).reduce(
  (total, entries) => total + entries.length,
  0,
);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify({
    source: sourceUrl,
    license: 'Apache-2.0',
    generatedAt: new Date().toISOString(),
    keyCount,
    entryCount,
    entries: dictionary,
  })}\n`,
);

console.log(
  `Generated ${outputPath} with ${entryCount} entries across ${keyCount} keys.`,
);
