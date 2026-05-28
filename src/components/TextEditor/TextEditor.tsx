import {
  forwardRef,
  useRef,
  useState,
  type ClipboardEvent,
  type CompositionEvent,
  type ForwardedRef,
} from 'react';
import { useFoldControls } from './useFoldControls';

type TextEditorProps = {
  defaultValue: string;
  privacyWarning: string;
  status: string;
  text: string;
  onDismissPrivacyWarning: () => void;
  onBeforeInput: (event: InputEvent) => void;
  onCompositionEnd: (event: CompositionEvent<HTMLTextAreaElement>) => void;
  onCompositionStart: (event: CompositionEvent<HTMLTextAreaElement>) => void;
  onCompositionUpdate: (event: CompositionEvent<HTMLTextAreaElement>) => void;
  onInput: (value: string) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
};

function setForwardedRef(
  forwardedRef: ForwardedRef<HTMLTextAreaElement>,
  value: HTMLTextAreaElement | null,
) {
  if (typeof forwardedRef === 'function') {
    forwardedRef(value);
    return;
  }

  if (forwardedRef) {
    forwardedRef.current = value;
  }
}

export const TextEditor = forwardRef<HTMLTextAreaElement, TextEditorProps>(
  function TextEditor(
    {
      defaultValue,
      privacyWarning,
      status,
      text,
      onDismissPrivacyWarning,
      onBeforeInput,
      onCompositionEnd,
      onCompositionStart,
      onCompositionUpdate,
      onInput,
      onKeyDown,
      onPaste,
    },
    ref,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const foldControls = useFoldControls({
      scrollTop,
      text,
      textareaRef,
    });

    return (
      <div className="text-editor">
        <span className="text-editor__header">
          <span className="text-editor__label">Text editor</span>
          <span className="editor-status" aria-live="polite">
            {status}
          </span>
        </span>
        {privacyWarning.length > 0 ? (
          <span className="text-editor__warning" role="status">
            <span>{privacyWarning}</span>
            <button
              className="text-editor__warning-close"
              type="button"
              aria-label="Dismiss warning"
              onClick={onDismissPrivacyWarning}
            >
              ×
            </button>
          </span>
        ) : null}
        <span className="text-editor__body">
          <textarea
            className="text-editor__textarea"
            defaultValue={defaultValue}
            aria-label="Text editor"
            placeholder="Start typing..."
            ref={(element) => {
              textareaRef.current = element;
              setForwardedRef(ref, element);
            }}
            spellCheck="true"
            onBeforeInput={(event) => {
              onBeforeInput(event.nativeEvent);
            }}
            onCompositionEnd={onCompositionEnd}
            onCompositionStart={onCompositionStart}
            onCompositionUpdate={onCompositionUpdate}
            onInput={(event) => {
              onInput(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
              onKeyDown(event.nativeEvent);
            }}
            onPaste={onPaste}
            onScroll={(event) => {
              setScrollTop(event.currentTarget.scrollTop);
            }}
          />
          <span className="text-editor__fold-layer">
            {foldControls.map((foldControl) => (
              <span
                className="text-editor__fold-item"
                key={foldControl.id}
                style={{
                  top: `${foldControl.titleTop}px`,
                  left: `calc(1rem + ${Math.min(foldControl.titleDisplayWidth + 3, 58)}ch)`,
                }}
              >
                <button
                  type="button"
                  className="text-editor__fold-toggle"
                  aria-label={`${foldControl.isFolded ? 'Unfold' : 'Fold'} ${foldControl.title}`}
                  onClick={foldControl.toggle}
                >
                  {foldControl.isFolded ? '▸' : '▾'}
                </button>
                {foldControl.isFolded ? (
                  <span
                    className="text-editor__fold-badge"
                    aria-hidden="true"
                  >
                    {foldControl.badgeLabel}
                  </span>
                ) : null}
              </span>
            ))}
          </span>
        </span>
      </div>
    );
  },
);
