import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const distDir = 'dist';
const port = 4180;

const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
};

function getFilePath(url) {
  const parsedUrl = new URL(url, `http://127.0.0.1:${port}`);
  const pathname = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
  const normalizedPath = normalize(pathname).replace(/^(\.\.[/\\])+/, '');

  return join(distDir, normalizedPath);
}

const server = createServer(async (request, response) => {
  try {
    const filePath = getFilePath(request.url ?? '/');
    const content = await readFile(filePath);
    response.writeHead(200, {
      'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
    });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

try {
  const indexResponse = await fetch(`http://127.0.0.1:${port}/`);
  const indexHtml = await indexResponse.text();

  if (!indexResponse.ok || !indexHtml.includes('<div id="root"></div>')) {
    throw new Error('Static host did not serve index.html.');
  }

  const assetMatches = [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)];

  for (const [, assetPath] of assetMatches) {
    const assetResponse = await fetch(`http://127.0.0.1:${port}${assetPath}`);

    if (!assetResponse.ok) {
      throw new Error(`Static host did not serve ${assetPath}.`);
    }
  }

  console.log('Generic static host smoke check passed.');
} finally {
  await new Promise((resolve) => server.close(resolve));
}
