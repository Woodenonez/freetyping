import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const rootUrl = 'http://127.0.0.1:4175/';
const debugUrl = 'http://127.0.0.1:9223/json';
const artifactDir = 'test-artifacts';

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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function captureViewport(send, name, width, height) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 640,
  });
  await wait(100);
  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });
  const bytes = Buffer.from(screenshot.result.data, 'base64');

  assert(bytes.length > 1000, `${name} screenshot is unexpectedly small.`);
  await writeFile(`${artifactDir}/${name}.png`, bytes);
}

const preview = spawnProcess('npm', [
  'run',
  'preview',
  '--',
  '--host',
  '127.0.0.1',
  '--port',
  '4175',
]);
const chrome = spawnProcess('google-chrome', [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--remote-debugging-port=9223',
  rootUrl,
]);

try {
  await mkdir(artifactDir, { recursive: true });
  await waitForHttp(rootUrl);
  const { send, socket } = await connectToChrome();

  const result = await evaluate(
    send,
    String.raw`
      (async () => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        localStorage.clear();
        const textarea = document.querySelector('textarea[aria-label="Text editor"]');
        if (!textarea) throw new Error('Editor missing');

        textarea.focus();
        document.execCommand('insertText', false, 'hello world');
        await sleep(50);
        const coreEditing = textarea.value;

        textarea.setSelectionRange(6, 11);
        document.execCommand('insertText', false, 'there');
        await sleep(50);
        const replaceEditing = textarea.value;

        const keyH = document.querySelector('button[aria-label="H key"]');
        keyH.click();
        await sleep(50);
        const virtualKeyboard = textarea.value.endsWith('h');

        const fileSummary = document.querySelector('summary[aria-label="File actions"]');
        fileSummary.click();
        const saveText = Array.from(fileSummary.parentElement.querySelectorAll('.menu-control__checkbox-item input'))[0];
        saveText.click();
        await sleep(50);
        textarea.value = 'persist me';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(450);
        const persisted = localStorage.getItem('freetyping:text') === 'persist me';

        const inputSummary = document.querySelector('summary[aria-label="Choose input mode"]');
        inputSummary.click();
        inputSummary.parentElement.querySelectorAll('.menu-control__item')[2].click();
        await sleep(50);
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        const press = async (key, code = '') => {
          textarea.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }));
          await sleep(30);
        };
        for (const char of 'ni') await press(char, 'Key' + char.toUpperCase());
        await press('ArrowRight', 'ArrowRight');
        await press(' ', 'Space');
        const pinyin = textarea.value;

        const clearButton = document.querySelector('button[aria-label="Clear editor text"]');
        clearButton.click();
        await sleep(50);
        const restoreButton = document.querySelector('button[aria-label="Restore previous text"]');
        const recoveryVisible = Boolean(restoreButton);
        restoreButton?.click();
        await sleep(50);
        const recovered = textarea.value;

        const stats = document.querySelector('dl[aria-label="Typing stats"]')?.textContent ?? '';

        return {
          coreEditing,
          replaceEditing,
          virtualKeyboard,
          persisted,
          pinyin,
          recoveryVisible,
          recovered,
          stats,
        };
      })()
    `,
  );

  assert(result.coreEditing === 'hello world', 'Core typing failed.');
  assert(result.replaceEditing === 'hello there', 'Select/replace editing failed.');
  assert(result.virtualKeyboard, 'Virtual keyboard insertion failed.');
  assert(result.persisted, 'Persistence failed.');
  assert(result.pinyin === '尼', 'Pinyin candidate selection failed.');
  assert(result.recoveryVisible, 'Recovery control did not appear.');
  assert(result.recovered === '尼', 'Recovery restore failed.');
  assert(result.stats.includes('Chars'), 'Stats did not render.');

  await captureViewport(send, 'desktop', 1280, 900);
  await captureViewport(send, 'tablet', 820, 900);
  await captureViewport(send, 'mobile', 390, 844);

  socket.close();
  console.log(`Browser smoke checks passed. Screenshots written to ${artifactDir}/`);
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

process.on('unhandledRejection', (error) => {
  console.error(error);
  for (const child of [chrome, preview]) {
    stopProcess(child);
  }
  process.exit(1);
});

console.log(`Used ${basename(process.argv[1])}.`);
