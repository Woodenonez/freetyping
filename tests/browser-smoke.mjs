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

  await evaluate(
    send,
    String.raw`
      (() => {
        localStorage.clear();
        localStorage.setItem('freetyping:inputModeId', '"zh-pinyin"');
        localStorage.setItem('freetyping:keyboardLayoutId', '"qwerty"');
      })()
    `,
  );
  await send('Page.reload', { ignoreCache: true });
  await wait(600);
  const pinyinMigration = await evaluate(
    send,
    String.raw`
      (() => ({
        inputMode: localStorage.getItem('freetyping:inputModeId'),
        layout: localStorage.getItem('freetyping:keyboardLayoutId'),
        status: document.querySelector('.editor-status')?.textContent ?? '',
      }))()
    `,
  );

  await evaluate(
    send,
    String.raw`
      (() => {
        localStorage.clear();
        localStorage.setItem('freetyping:inputModeId', '"nordic-direct"');
        localStorage.setItem('freetyping:keyboardLayoutId', '"nordic"');
      })()
    `,
  );
  await send('Page.reload', { ignoreCache: true });
  await wait(600);
  const nordicMigration = await evaluate(
    send,
    String.raw`
      (() => ({
        inputMode: localStorage.getItem('freetyping:inputModeId'),
        layout: localStorage.getItem('freetyping:keyboardLayoutId'),
        status: document.querySelector('.editor-status')?.textContent ?? '',
      }))()
    `,
  );

  assert(
    pinyinMigration.inputMode === '"overlay"' &&
      pinyinMigration.layout === '"pinyin-cn"' &&
      pinyinMigration.status.includes('Overlay Input · Pinyin (CN)'),
    'Old Pinyin input settings did not migrate to Overlay + Pinyin (CN).',
  );
  assert(
    nordicMigration.inputMode === '"overlay"' &&
      nordicMigration.layout === '"qwerty"' &&
      nordicMigration.status.includes('Overlay Input · QWERTY'),
    'Old combined Nordic input settings did not migrate to Overlay + QWERTY.',
  );

  await evaluate(send, 'localStorage.clear()');
  await send('Page.reload', { ignoreCache: true });
  await wait(600);

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
        const initialStatsText = document.querySelector('dl[aria-label="Typing stats"]')?.textContent ?? '';

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
        const saveTextUncheckedByDefault = saveText?.checked === false;
        const aboutSummary = fileSummary.parentElement.querySelector('summary[aria-label="About"]');
        aboutSummary?.click();
        await sleep(50);
        const aboutText = aboutSummary?.parentElement?.textContent ?? '';
        saveText.click();
        await sleep(50);
        textarea.value = 'persist me';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(450);
        const persisted = localStorage.getItem('freetyping:text') === 'persist me';
        saveText.click();
        await sleep(50);
        const savedTextRemovedWhenDisabled = localStorage.getItem('freetyping:text') === null;
        const saveWarning = document.querySelector('.text-editor__warning')?.textContent ?? '';
        document.querySelector('button[aria-label="Dismiss warning"]')?.click();
        await sleep(50);
        const saveWarningDismissed = !document.querySelector('.text-editor__warning');

        const panelSummary = document.querySelector('summary[aria-label="Choose visible input panels"]');
        panelSummary.click();
        const panelMenu = panelSummary.parentElement;
        const getPanelItem = (label) =>
          Array.from(panelMenu.querySelectorAll('.menu-control__item')).find(
            (item) => item.textContent?.trim() === label,
          );
        getPanelItem('Pinyin (CN)')?.click();
        await sleep(100);
        panelSummary.click();
        await sleep(50);

        const inputSummary = document.querySelector('summary[aria-label="Choose input mode"]');
        inputSummary.click();
        Array.from(inputSummary.parentElement.querySelectorAll('.menu-control__item')).find(
          (item) => item.textContent?.trim() === 'Overlay Input',
        )?.click();
        await sleep(50);
        const pageCountCheckbox = inputSummary.parentElement.querySelector('input[aria-label="Show Pinyin page count"]');
        const fuzzyCheckbox = inputSummary.parentElement.querySelector('input[aria-label="Use fuzzy Pinyin matching"]');
        const pinyinSettingsVisible = Boolean(pageCountCheckbox);
        const pinyinFuzzyVisible = Boolean(fuzzyCheckbox);
        if (!pageCountCheckbox?.checked) pageCountCheckbox?.click();
        if (!fuzzyCheckbox?.checked) fuzzyCheckbox?.click();
        await sleep(700);
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        const press = async (key, code = '') => {
          textarea.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }));
          await sleep(30);
        };
        for (const char of 'ni') await press(char, 'Key' + char.toUpperCase());
        await press(' ', 'Space');
        const pinyin = textarea.value;

        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        for (const char of 'shi') await press(char, 'Key' + char.toUpperCase());
        await sleep(50);
        const visibleCandidateCount = document.querySelectorAll('.pinyin-bar__candidate').length;
        const firstCandidatePage = document.querySelector('.pinyin-bar__page')?.textContent ?? '';
        await press('ArrowDown', 'ArrowDown');
        await sleep(50);
        const lastCandidatePage = document.querySelector('.pinyin-bar__page')?.textContent ?? '';
        await press('1', 'Digit1');
        const pagedPinyin = textarea.value;

        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        for (const char of 'xianshi') await press(char, 'Key' + char.toUpperCase());
        await press(' ', 'Space');
        const realPhrasePinyin = textarea.value;

        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await press('.', 'Period');
        const chinesePunctuation = textarea.value;

        const clearButton = document.querySelector('button[aria-label="Clear editor text"]');
        clearButton.click();
        await sleep(50);
        const restoreButton = document.querySelector('button[aria-label="Restore previous text"]');
        const recoveryVisible = Boolean(restoreButton);
        restoreButton?.click();
        await sleep(50);
        const recovered = textarea.value;

        textarea.value = '# Notes\nline one\nline two\n\nafter';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(50);
        const foldButton = document.querySelector('button[aria-label="Fold Notes"]');
        const foldButtonVisible = Boolean(foldButton);
        foldButton?.click();
        await sleep(50);
        const foldedValue = textarea.value;
        const foldedButton = document.querySelector('button[aria-label="Unfold Notes"]');
        const foldBadgeElement = document.querySelector('.text-editor__fold-badge');
        const foldBadge = foldBadgeElement?.textContent ?? '';
        const foldedButtonRight = foldedButton?.getBoundingClientRect().right ?? 0;
        const foldBadgeLeft = foldBadgeElement?.getBoundingClientRect().left ?? 0;
        const unfoldButton = document.querySelector('button[aria-label="Unfold Notes"]');
        unfoldButton?.click();
        await sleep(50);
        const unfoldedValue = textarea.value;

        textarea.value = '# 标题\n一行\n\n';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(50);
        const chineseFoldButton = document.querySelector('button[aria-label="Fold 标题"]');
        const chineseFoldLeft = chineseFoldButton
          ? chineseFoldButton.getBoundingClientRect().left
          : 0;

        textarea.value = '# abc\none\n\n';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(50);
        const englishFoldButton = document.querySelector('button[aria-label="Fold abc"]');
        const englishFoldLeft = englishFoldButton
          ? englishFoldButton.getBoundingClientRect().left
          : 0;
        const englishTitleWidth = (() => {
          const measurer = document.createElement('span');
          const textareaStyles = window.getComputedStyle(textarea);
          measurer.textContent = '# abc';
          measurer.style.font = textareaStyles.font;
          measurer.style.position = 'absolute';
          measurer.style.visibility = 'hidden';
          measurer.style.whiteSpace = 'pre';
          document.body.appendChild(measurer);
          const width = measurer.getBoundingClientRect().width;
          measurer.remove();
          return width;
        })();
        const englishTitleEnd =
          textarea.getBoundingClientRect().left + 16 + englishTitleWidth;

        const stats = document.querySelector('dl[aria-label="Typing stats"]')?.textContent ?? '';

        panelSummary.click();
        getPanelItem('Realistic')?.click();
        await sleep(100);
        const realisticApplied =
          document.querySelector('.virtual-input-panel')?.dataset.appearance === 'realistic';
        const skinVisible = Boolean(getPanelItem('Dark mechanical'));
        const naturalWoodVisible = Boolean(getPanelItem('Natural wood'));
        getPanelItem('Dark mechanical')?.click();
        await sleep(100);
        const darkSkinApplied =
          document.querySelector('.virtual-input-panel')?.dataset.skin === 'dark-mechanical';
        getPanelItem('Natural wood')?.click();
        await sleep(100);
        const naturalWoodApplied =
          document.querySelector('.virtual-input-panel')?.dataset.skin === 'natural-wood';
        const naturalWoodKeyColorBeforeTheme =
          window.getComputedStyle(document.querySelector('.virtual-key')).color;
        const themeSummary = document.querySelector('summary[aria-label="Choose theme"]');
        themeSummary.click();
        Array.from(themeSummary.parentElement.querySelectorAll('.menu-control__item')).find(
          (item) => item.textContent?.trim() === 'High contrast',
        )?.click();
        await sleep(100);
        const naturalWoodUnaffectedByTheme =
          window.getComputedStyle(document.querySelector('.virtual-key')).color ===
          naturalWoodKeyColorBeforeTheme;
        const naturalWoodKeyBackgrounds = Array.from(
          document.querySelectorAll('.virtual-key'),
        )
          .slice(0, 4)
          .map((key) => window.getComputedStyle(key).backgroundImage);
        const naturalWoodMixedKeyColors = new Set(naturalWoodKeyBackgrounds).size > 1;
        Array.from(themeSummary.parentElement.querySelectorAll('.menu-control__item')).find(
          (item) => item.textContent?.trim() === 'Light',
        )?.click();
        await sleep(100);
        getPanelItem('Simple')?.click();
        await sleep(100);
        const simpleApplied =
          document.querySelector('.virtual-input-panel')?.dataset.appearance === 'simple';
        const skinHiddenInSimple = !getPanelItem('Dark mechanical');
        getPanelItem('Realistic')?.click();
        await sleep(100);
        const persistedAppearance =
          localStorage.getItem('freetyping:panelAppearance') === '"realistic"';
        const persistedSkin =
          localStorage.getItem('freetyping:panelSkin') === '"natural-wood"';
        getPanelItem('Simple')?.click();
        await sleep(100);
        getPanelItem('Nordic (SE/FI)')?.click();
        await sleep(100);
        const nordicLayoutApplied =
          localStorage.getItem('freetyping:keyboardLayoutId') === '"nordic-se-fi"';
        const overlayInputSelected =
          document.querySelector('.editor-status')?.textContent?.includes('Overlay Input') ??
          false;
        const nordicKeysVisible =
          Boolean(document.querySelector('button[aria-label="Å key"]')) &&
          Boolean(document.querySelector('button[aria-label="Ä key"]')) &&
          Boolean(document.querySelector('button[aria-label="Ö key"]'));
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('button[aria-label="Å key"]')?.click();
        document.querySelector('button[aria-label="Ä key"]')?.click();
        document.querySelector('button[aria-label="Ö key"]')?.click();
        await sleep(50);
        const nordicVirtualText = textarea.value;
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: ';',
            code: 'Semicolon',
            bubbles: true,
            cancelable: true,
          }),
        );
        textarea.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: '"',
            code: 'Quote',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
          }),
        );
        await sleep(50);
        const nordicPhysicalText = textarea.value;
        getPanelItem('Nordic (NO)')?.click();
        await sleep(100);
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new KeyboardEvent('keydown', {
          key: ';',
          code: 'Semicolon',
          bubbles: true,
          cancelable: true,
        }));
        textarea.dispatchEvent(new KeyboardEvent('keydown', {
          key: "'",
          code: 'Quote',
          bubbles: true,
          cancelable: true,
        }));
        await sleep(50);
        const nordicNoPhysicalText = textarea.value;
        getPanelItem('Nordic (DK)')?.click();
        await sleep(100);
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new KeyboardEvent('keydown', {
          key: ';',
          code: 'Semicolon',
          bubbles: true,
          cancelable: true,
        }));
        textarea.dispatchEvent(new KeyboardEvent('keydown', {
          key: "'",
          code: 'Quote',
          bubbles: true,
          cancelable: true,
        }));
        await sleep(50);
        const nordicDkPhysicalText = textarea.value;
        panelSummary.click();
        await sleep(50);

        inputSummary.click();
        await sleep(50);
        const inputModeLabels = Array.from(
          inputSummary.parentElement.querySelectorAll('.menu-control__item'),
        ).map((item) => item.textContent?.trim());
        const inputModeOnlySystemOverlay =
          inputModeLabels.includes('System Input') &&
          inputModeLabels.includes('Overlay Input') &&
          !inputModeLabels.includes('English Direct') &&
          !inputModeLabels.includes('Chinese Pinyin') &&
          !inputModeLabels.includes('Nordic Direct');
        inputSummary.click();
        await sleep(50);

        panelSummary.click();
        getPanelItem('QWERTY')?.click();
        await sleep(100);
        const qwertyLayoutApplied =
          localStorage.getItem('freetyping:keyboardLayoutId') === '"qwerty"';
        const qwertyKeepsOverlay =
          document.querySelector('.editor-status')?.textContent?.includes('Overlay Input') ??
          false;
        getPanelItem('Pinyin (CN)')?.click();
        await sleep(100);
        const pinyinLayoutApplied =
          localStorage.getItem('freetyping:keyboardLayoutId') === '"pinyin-cn"';
        const pinyinLayoutKeepsOverlay =
          document.querySelector('.editor-status')?.textContent?.includes('Overlay Input · Pinyin (CN)') ??
          false;
        panelSummary.click();
        await sleep(50);

        fileSummary.click();
        const helpSummary = fileSummary.parentElement.querySelector('summary[aria-label="Help"]');
        helpSummary?.click();
        await sleep(50);
        const helpText = helpSummary?.parentElement?.textContent ?? '';
        fileSummary.click();

        return {
          coreEditing,
          initialStatsText,
          replaceEditing,
          virtualKeyboard,
          saveTextUncheckedByDefault,
          aboutText,
          persisted,
          savedTextRemovedWhenDisabled,
          saveWarning,
          saveWarningDismissed,
          pinyinSettingsVisible,
          pinyinFuzzyVisible,
          pinyin,
          visibleCandidateCount,
          firstCandidatePage,
          lastCandidatePage,
          pagedPinyin,
          realPhrasePinyin,
          chinesePunctuation,
          recoveryVisible,
          recovered,
          foldButtonVisible,
          foldedValue,
          foldBadge,
          foldedButtonRight,
          foldBadgeLeft,
          unfoldedValue,
          chineseFoldLeft,
          englishFoldLeft,
          englishTitleEnd,
          stats,
          realisticApplied,
          skinVisible,
          naturalWoodVisible,
          darkSkinApplied,
          naturalWoodApplied,
          naturalWoodUnaffectedByTheme,
          naturalWoodMixedKeyColors,
          simpleApplied,
          skinHiddenInSimple,
          persistedAppearance,
          persistedSkin,
          nordicLayoutApplied,
          overlayInputSelected,
          nordicKeysVisible,
          nordicVirtualText,
          nordicPhysicalText,
          nordicNoPhysicalText,
          nordicDkPhysicalText,
          inputModeOnlySystemOverlay,
          qwertyLayoutApplied,
          qwertyKeepsOverlay,
          pinyinLayoutApplied,
          pinyinLayoutKeepsOverlay,
          helpText,
        };
      })()
    `,
  );

  assert(result.coreEditing === 'hello world', 'Core typing failed.');
  assert(result.initialStatsText.includes('WPM-'), 'WPM should be hidden while timer is stopped.');
  assert(result.replaceEditing === 'hello there', 'Select/replace editing failed.');
  assert(result.virtualKeyboard, 'Virtual keyboard insertion failed.');
  assert(result.saveTextUncheckedByDefault, 'Save text should be unchecked by default.');
  assert(result.aboutText.includes('FreeTyping'), 'About menu did not appear.');
  assert(result.aboutText.includes('pure text editing'), 'About menu text was missing.');
  assert(result.aboutText.includes('browser-based input methods'), 'About menu text was missing.');
  assert(result.persisted, 'Persistence failed.');
  assert(result.savedTextRemovedWhenDisabled, 'Disabling local save did not remove saved text.');
  assert(result.saveWarning.includes('Text saving disabled'), 'Save warning did not appear in editor.');
  assert(result.saveWarningDismissed, 'Save warning could not be dismissed.');
  assert(result.pinyinSettingsVisible, 'Pinyin settings menu did not appear.');
  assert(result.pinyinFuzzyVisible, 'Pinyin fuzzy setting did not appear.');
  assert(result.pinyin === '你', 'Pinyin candidate selection failed.');
  assert(result.visibleCandidateCount === 9, 'Pinyin candidates were not paginated.');
  assert(result.firstCandidatePage.startsWith('1/'), 'First candidate page did not render.');
  assert(result.lastCandidatePage !== result.firstCandidatePage, 'ArrowDown did not move to the final candidate page.');
  assert(result.pagedPinyin.length > 0 && result.pagedPinyin !== 'shi', 'Number selection did not use the visible candidate page.');
  assert(result.realPhrasePinyin === '显示', 'Real Pinyin phrase lookup failed.');
  assert(result.chinesePunctuation === '。', 'Chinese punctuation insertion failed.');
  assert(result.recoveryVisible, 'Recovery control did not appear.');
  assert(result.recovered === '。', 'Recovery restore failed.');
  assert(result.foldButtonVisible, 'Fold control did not appear for # title section.');
  assert(
    result.foldedValue === '# Notes\n\nafter',
    'Fold did not collapse body lines out of the textarea.',
  );
  assert(result.foldBadge.includes('2 folded lines'), 'Fold badge did not appear.');
  assert(
    result.foldBadgeLeft > result.foldedButtonRight,
    'Fold badge did not appear after the fold button.',
  );
  assert(
    result.unfoldedValue === '# Notes\nline one\nline two\n\nafter',
    'Unfold did not restore the folded body text.',
  );
  assert(
    result.chineseFoldLeft > result.englishFoldLeft,
    'Chinese fold title did not reserve double-width spacing.',
  );
  assert(
    result.englishFoldLeft - result.englishTitleEnd > 8,
    'English fold control is too close to the title.',
  );
  assert(result.stats.includes('Chars'), 'Stats did not render.');
  assert(result.realisticApplied, 'Realistic panel appearance was not applied.');
  assert(result.skinVisible, 'Panel skin controls did not appear for realistic appearance.');
  assert(result.naturalWoodVisible, 'Natural wood skin control did not appear.');
  assert(result.darkSkinApplied, 'Dark mechanical skin was not applied.');
  assert(result.naturalWoodApplied, 'Natural wood skin was not applied.');
  assert(
    result.naturalWoodUnaffectedByTheme,
    'Realistic panel skin should not be overridden by the app theme.',
  );
  assert(result.naturalWoodMixedKeyColors, 'Natural wood skin should use mixed key colors.');
  assert(result.simpleApplied, 'Simple panel appearance was not restored.');
  assert(result.skinHiddenInSimple, 'Skin controls should be hidden for simple appearance.');
  assert(result.persistedAppearance, 'Panel appearance was not persisted.');
  assert(result.persistedSkin, 'Panel skin was not persisted.');
  assert(result.nordicLayoutApplied, 'Nordic layout was not persisted.');
  assert(result.overlayInputSelected, 'Nordic layout did not switch to Overlay Input.');
  assert(result.nordicKeysVisible, 'Nordic character keys did not render.');
  assert(
    result.nordicVirtualText === 'åäö',
    'Nordic virtual keys did not insert their displayed characters.',
  );
  assert(
    result.nordicPhysicalText === 'öÄ',
    'Overlay Input did not map Swedish/Finnish physical key codes to Nordic characters.',
  );
  assert(result.nordicNoPhysicalText === 'øæ', 'Norwegian Nordic mapping was incorrect.');
  assert(result.nordicDkPhysicalText === 'æø', 'Danish Nordic mapping was incorrect.');
  assert(result.inputModeOnlySystemOverlay, 'Input Mode should only show System and Overlay.');
  assert(result.qwertyLayoutApplied, 'QWERTY layout was not restored.');
  assert(
    result.qwertyKeepsOverlay,
    'Switching from Nordic layout to QWERTY should keep Overlay Input.',
  );
  assert(
    result.pinyinLayoutApplied,
    'Selecting Pinyin layout should persist Pinyin (CN).',
  );
  assert(
    result.pinyinLayoutKeepsOverlay,
    'Selecting Pinyin layout should use the Pinyin overlay handler.',
  );
  assert(result.helpText.includes('System Input'), 'Help should describe System Input.');
  assert(result.helpText.includes('Overlay Input'), 'Help should describe Overlay Input.');
  assert(!result.helpText.includes('Pinyin'), 'Help should use general input terms.');

  await captureViewport(send, 'desktop', 1280, 900);
  await captureViewport(send, 'tablet', 820, 900);
  await captureViewport(send, 'mobile', 390, 844);

  await evaluate(
    send,
    String.raw`
      (async () => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const panelSummary = document.querySelector('summary[aria-label="Choose visible input panels"]');
        panelSummary.click();
        const panelMenu = panelSummary.parentElement;
        const getPanelItem = (label) =>
          Array.from(panelMenu.querySelectorAll('.menu-control__item')).find(
            (item) => item.textContent?.trim() === label,
          );
        getPanelItem('Realistic')?.click();
        await sleep(50);
        getPanelItem('Natural wood')?.click();
        await sleep(50);
        getPanelItem('Nordic (SE/FI)')?.click();
        await sleep(50);
        panelSummary.click();
      })()
    `,
  );
  await captureViewport(send, 'desktop-realistic-panel', 1280, 900);

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
