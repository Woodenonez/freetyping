import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = 'dist';
const maxTotalBytes = 450 * 1024;
const maxJavaScriptBytes = 300 * 1024;

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
let javascriptBytes = 0;

for (const file of files) {
  const fileStat = await stat(file);
  totalBytes += fileStat.size;

  if (file.endsWith('.js')) {
    javascriptBytes += fileStat.size;
  }
}

if (totalBytes > maxTotalBytes) {
  throw new Error(`Bundle too large: ${totalBytes} bytes.`);
}

if (javascriptBytes > maxJavaScriptBytes) {
  throw new Error(`JavaScript bundle too large: ${javascriptBytes} bytes.`);
}

console.log(
  `Bundle audit passed: ${totalBytes} total bytes, ${javascriptBytes} JavaScript bytes.`,
);
