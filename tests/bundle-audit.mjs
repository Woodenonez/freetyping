import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = 'dist';
const maxInitialBytes = 450 * 1024;
const maxJavaScriptBytes = 300 * 1024;
const maxPinyinDictionaryBytes = 2 * 1024 * 1024;

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(path)));
    } else {
      files.push(path);
    }
  }

  return files;
}

const files = await walkFiles(distDir);
let totalBytes = 0;
let initialBytes = 0;
let javascriptBytes = 0;
let pinyinDictionaryBytes = 0;

for (const file of files) {
  const fileStat = await stat(file);
  totalBytes += fileStat.size;

  if (file.endsWith('pinyin-dictionary.json')) {
    pinyinDictionaryBytes += fileStat.size;
  } else {
    initialBytes += fileStat.size;
  }

  if (file.endsWith('.js')) {
    javascriptBytes += fileStat.size;
  }
}

if (initialBytes > maxInitialBytes) {
  throw new Error(`Initial bundle too large: ${initialBytes} bytes.`);
}

if (javascriptBytes > maxJavaScriptBytes) {
  throw new Error(`JavaScript bundle too large: ${javascriptBytes} bytes.`);
}

if (pinyinDictionaryBytes > maxPinyinDictionaryBytes) {
  throw new Error(`Pinyin dictionary too large: ${pinyinDictionaryBytes} bytes.`);
}

console.log(
  `Bundle audit passed: ${initialBytes} initial bytes, ${javascriptBytes} JavaScript bytes, ${pinyinDictionaryBytes} Pinyin dictionary bytes, ${totalBytes} total bytes.`,
);
