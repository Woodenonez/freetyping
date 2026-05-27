import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CompositionEvent,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import { STORAGE_KEYS, type Theme } from './appState';
import { TEXT_PERSIST_DEBOUNCE_MS } from './config';
import { PinyinCandidateBar } from '../components/PinyinCandidateBar/PinyinCandidateBar';
import { RecoveryBar } from '../components/RecoveryBar/RecoveryBar';
import { StatsBar } from '../components/StatsBar/StatsBar';
import { TextEditor } from '../components/TextEditor/TextEditor';
import { TopBar } from '../components/TopBar/TopBar';
import { VirtualInputPanel } from '../components/VirtualInputPanel/VirtualInputPanel';
import { useKeyboardTracker } from '../hooks/useKeyboardTracker';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { useMouseTracker } from '../hooks/useMouseTracker';
import {
  applyInputResult,
  createInputContext,
  getInputMode,
} from '../input/inputManager';
import { useChinesePinyinController } from '../input/modes/chinesePinyin';
import { copyTextToClipboard } from '../utils/clipboard';
import {
  createEditorAdapter,
  type EditorAdapter,
} from '../utils/editorAdapter';
import { exportTextFile, importTextFile } from '../utils/textFile';
import { calculateTypingStats } from '../utils/typingStats';

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 28;

function clampFontSize(fontSize: number): number {
  if (!Number.isFinite(fontSize)) {
    return 18;
  }

  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, fontSize));
}

export function App() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [editor, setEditor] = useState<EditorAdapter | null>(null);
  const [text, setText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isSessionTimerRunning, setIsSessionTimerRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [recoverableText, setRecoverableText] = useState<{
    text: string;
    reason: string;
  } | null>(null);
  const [inputModeId, setInputModeId] = useLocalStorageState(
    STORAGE_KEYS.inputModeId,
    'system',
  );
  const [keyboardVisible, setKeyboardVisible] = useLocalStorageState(
    STORAGE_KEYS.keyboardVisible,
    true,
  );
  const [mouseVisible, setMouseVisible] = useLocalStorageState(
    STORAGE_KEYS.mouseVisible,
    true,
  );
  const [theme, setTheme] = useLocalStorageState<Theme>(
    STORAGE_KEYS.theme,
    'light',
  );
  const [fontSize, setFontSize] = useLocalStorageState(
    STORAGE_KEYS.fontSize,
    18,
  );
  const [saveTextLocally, setSaveTextLocally] = useLocalStorageState(
    STORAGE_KEYS.saveTextLocally,
    false,
  );
  const activeKeys = useKeyboardTracker();
  const { activeMouseButtons, markMouseButton } = useMouseTracker();
  const chinesePinyin = useChinesePinyinController(inputModeId === 'zh-pinyin');

  const inputMode = useMemo(() => {
    if (inputModeId === 'zh-pinyin') {
      return chinesePinyin.inputMode;
    }

    return getInputMode(inputModeId);
  }, [chinesePinyin.inputMode, inputModeId]);

  const typingStats = useMemo(
    () => calculateTypingStats(text, sessionSeconds),
    [sessionSeconds, text],
  );

  const initialText = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    const shouldRestoreText =
      window.localStorage.getItem(STORAGE_KEYS.saveTextLocally) === 'true';

    if (!shouldRestoreText) {
      return '';
    }

    return window.localStorage.getItem(STORAGE_KEYS.text) ?? '';
  }, []);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    const adapter = createEditorAdapter(textareaRef.current);
    setEditor(adapter);
    setText(adapter.getValue());
  }, []);

  useEffect(() => {
    if (!saveTextLocally) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEYS.text, text);
    }, TEXT_PERSIST_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [saveTextLocally, text]);

  useEffect(() => {
    if (!isSessionTimerRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSessionSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSessionTimerRunning]);

  const getContext = useCallback(() => {
    if (!editor) {
      return null;
    }

    return createInputContext(editor, isComposing);
  }, [editor, isComposing]);

  const handleInput = useCallback((value: string) => {
    setText(value);
  }, []);

  const handleBeforeInput = useCallback(
    (event: InputEvent) => {
      if (!editor || isComposing || !inputMode.onBeforeInput) {
        return;
      }

      const context = getContext();
      if (!context) {
        return;
      }

      const shouldPreventDefault = applyInputResult(
        editor,
        inputMode.onBeforeInput(event, context),
      );

      if (shouldPreventDefault) {
        event.preventDefault();
      }
    },
    [editor, getContext, inputMode, isComposing],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!editor || isComposing || !inputMode.onKeyDown) {
        return;
      }

      const context = getContext();
      if (!context) {
        return;
      }

      const shouldPreventDefault = applyInputResult(
        editor,
        inputMode.onKeyDown(event, context),
      );

      if (shouldPreventDefault) {
        event.preventDefault();
      }
    },
    [editor, getContext, inputMode, isComposing],
  );

  const handleCompositionStart = useCallback(
    (event: CompositionEvent<HTMLTextAreaElement>) => {
      setIsComposing(true);
      const context = getContext();
      if (context) {
        inputMode.onCompositionStart?.(event.nativeEvent, context);
      }
    },
    [getContext, inputMode],
  );

  const handleCompositionUpdate = useCallback(
    (event: CompositionEvent<HTMLTextAreaElement>) => {
      const context = getContext();
      if (context) {
        inputMode.onCompositionUpdate?.(event.nativeEvent, context);
      }
    },
    [getContext, inputMode],
  );

  const handleCompositionEnd = useCallback(
    (event: CompositionEvent<HTMLTextAreaElement>) => {
      const context = getContext();
      if (context && editor) {
        const shouldPreventDefault = applyInputResult(
          editor,
          inputMode.onCompositionEnd?.(event.nativeEvent, context),
        );

        if (shouldPreventDefault) {
          event.preventDefault();
        }
      }

      setIsComposing(false);
    },
    [editor, getContext, inputMode],
  );

  const stashRecoverableText = useCallback(
    (reason: string) => {
      const currentText = editor?.getValue() ?? text;

      if (currentText.length > 0) {
        setRecoverableText({ text: currentText, reason });
      }
    },
    [editor, text],
  );

  const handleClearText = useCallback(() => {
    stashRecoverableText('Text cleared.');
    editor?.setValue('');
    editor?.focus();
    setStatusMessage('Editor text cleared.');
  }, [editor, stashRecoverableText]);

  const handleCopyText = useCallback(() => {
    void copyTextToClipboard(editor?.getValue() ?? text)
      .then(() => {
        setStatusMessage('Text copied.');
      })
      .catch(() => {
        setStatusMessage('Could not copy text.');
      });
  }, [editor, text]);

  const handleClearSavedText = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEYS.text);
    setStatusMessage('Saved text cleared from this browser.');
  }, []);

  const handleExportText = useCallback(() => {
    try {
      exportTextFile(editor?.getValue() ?? text);
      setStatusMessage('Text export started.');
    } catch {
      setStatusMessage('Could not export text.');
    }
  }, [editor, text]);

  const handleImportText = useCallback(
    (file: File) => {
      void importTextFile(file)
        .then((importedText) => {
          stashRecoverableText('Text replaced by import.');
          editor?.setValue(importedText);
          editor?.focus();
          setStatusMessage('Text imported.');
        })
        .catch((error: unknown) => {
          setStatusMessage(
            error instanceof Error ? error.message : 'Could not import text.',
          );
        });
    },
    [editor, stashRecoverableText],
  );

  const handleRestoreRecoverableText = useCallback(() => {
    if (!recoverableText) {
      return;
    }

    editor?.setValue(recoverableText.text);
    editor?.focus();
    setStatusMessage('Previous text restored.');
    setRecoverableText(null);
  }, [editor, recoverableText]);

  const handleInputModeChange = useCallback(
    (nextInputModeId: string) => {
      if (inputModeId === 'zh-pinyin' && nextInputModeId !== 'zh-pinyin') {
        chinesePinyin.reset();
      }

      setInputModeId(nextInputModeId);
      editor?.focus();
    },
    [chinesePinyin, editor, inputModeId, setInputModeId],
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      markMouseButton(event.button);
    },
    [markMouseButton],
  );

  return (
    <main
      className="app-shell"
      data-theme={theme}
      onMouseDown={handleMouseDown}
      style={
        { '--editor-font-size': `${clampFontSize(fontSize)}px` } as CSSProperties
      }
    >
      <TopBar
        inputModeId={inputModeId}
        onInputModeChange={handleInputModeChange}
        keyboardVisible={keyboardVisible}
        mouseVisible={mouseVisible}
        onKeyboardVisibleChange={setKeyboardVisible}
        onMouseVisibleChange={setMouseVisible}
        onClearText={handleClearText}
        onCopyText={handleCopyText}
        onClearSavedText={handleClearSavedText}
        onExportText={handleExportText}
        onImportText={handleImportText}
        saveTextLocally={saveTextLocally}
        onToggleSaveTextLocally={() => {
          setSaveTextLocally((currentValue) => !currentValue);
        }}
        theme={theme}
        onThemeChange={setTheme}
        fontSize={clampFontSize(fontSize)}
        onFontSizeChange={(nextFontSize) => {
          setFontSize(clampFontSize(nextFontSize));
        }}
      />

      <section className="editor-region" aria-label="Editor">
        <StatsBar
          isTimerRunning={isSessionTimerRunning}
          onResetTimer={() => {
            setSessionSeconds(0);
          }}
          onToggleTimer={() => {
            setIsSessionTimerRunning((currentValue) => !currentValue);
          }}
          stats={typingStats}
        />
        {statusMessage.length > 0 ? (
          <div className="app-status" role="status">
            {statusMessage}
          </div>
        ) : null}
        {recoverableText ? (
          <RecoveryBar
            reason={recoverableText.reason}
            onDismiss={() => setRecoverableText(null)}
            onRestore={handleRestoreRecoverableText}
          />
        ) : null}
        <TextEditor
          defaultValue={initialText}
          status={`${inputMode.label}${isComposing ? ' composing' : ''}`}
          ref={textareaRef}
          onBeforeInput={handleBeforeInput}
          onCompositionEnd={handleCompositionEnd}
          onCompositionStart={handleCompositionStart}
          onCompositionUpdate={handleCompositionUpdate}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        {inputModeId === 'zh-pinyin' ? (
          <PinyinCandidateBar viewState={chinesePinyin.viewState} />
        ) : null}
      </section>

      {keyboardVisible || mouseVisible ? (
        <section className="virtual-panel" aria-labelledby="virtual-panel-heading">
          <div className="region-heading">
            <h2 id="virtual-panel-heading">Virtual Input Panel</h2>
          </div>
          <VirtualInputPanel
            activeKeys={activeKeys}
            activeMouseButtons={activeMouseButtons}
            editor={editor}
            keyboardVisible={keyboardVisible}
            mouseVisible={mouseVisible}
          />
        </section>
      ) : null}
    </main>
  );
}
