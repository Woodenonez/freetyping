import { spawn } from 'node:child_process';
import { basename } from 'node:path';

const rootUrl = 'http://127.0.0.1:4176/';
const debugUrl = 'http://127.0.0.1:9224/json';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function spawnProcess(command, args) {
  return spawn(command, args, {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function stopProcess(child) {
  if (child.killed || child.pid === undefined) {
    return;
  }

  try {
    process.kill(-child.pid);
  } catch {
    try {
      child.kill();
    } catch {
      // Already stopped.
    }
  }
}

async function waitForHttp(url, timeoutMs = 10000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until timeout.
    }

    await wait(100);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function connectToChrome() {
  await waitForHttp(debugUrl);
  const tabs = await fetch(debugUrl).then((response) => response.json());
  const page = tabs.find((tab) => tab.type === 'page');

  if (!page) {
    throw new Error('No Chrome page target found.');
  }

  const socket = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  });

  await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));

  function send(method, params = {}) {
    const messageId = ++id;
    socket.send(JSON.stringify({ id: messageId, method, params }));
    return new Promise((resolve) => pending.set(messageId, resolve));
  }

  await send('Runtime.enable');
  await send('Page.enable');

  return { send, socket };
}

async function evaluate(send, expression) {
  const response = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (response.result?.exceptionDetails) {
    throw new Error(
      response.result.exceptionDetails.exception?.description ??
        response.result.exceptionDetails.text,
    );
  }

  return response.result.result.value;
}

const preview = spawnProcess('npm', [
  'run',
  'preview',
  '--',
  '--host',
  '127.0.0.1',
  '--port',
  '4176',
]);
const chrome = spawnProcess('google-chrome', [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--remote-debugging-port=9224',
  rootUrl,
]);

try {
  await waitForHttp(rootUrl);
  const { send, socket } = await connectToChrome();

  const violations = await evaluate(
    send,
    String.raw`
      (() => {
        const violations = [];
        const controls = document.querySelectorAll('button, input, textarea, select, summary');

        for (const control of controls) {
          const text = control.textContent?.trim() ?? '';
          const label = control.getAttribute('aria-label') ?? '';
          const title = control.getAttribute('title') ?? '';

          if (!text && !label && !title) {
            violations.push(control.outerHTML);
          }
        }

        if (!document.querySelector('main')) {
          violations.push('Missing main landmark.');
        }

        if (!document.querySelector('textarea[aria-label="Text editor"]')) {
          violations.push('Missing labelled text editor.');
        }

        return violations;
      })()
    `,
  );

  if (violations.length > 0) {
    throw new Error(`Accessibility audit failed:\n${violations.join('\n')}`);
  }

  socket.close();
  console.log('Accessibility audit passed.');
} finally {
  for (const child of [chrome, preview]) {
    stopProcess(child);
  }

  await wait(250);
}

process.on('exit', () => {
  for (const child of [chrome, preview]) {
    stopProcess(child);
  }
});

console.log(`Used ${basename(process.argv[1])}.`);
