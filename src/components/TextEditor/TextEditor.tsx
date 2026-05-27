import { forwardRef, type ClipboardEvent, type CompositionEvent } from 'react';

type TextEditorProps = {
  defaultValue: string;
  status: string;
  onBeforeInput: (event: InputEvent) => void;
  onCompositionEnd: (event: CompositionEvent<HTMLTextAreaElement>) => void;
  onCompositionStart: (event: CompositionEvent<HTMLTextAreaElement>) => void;
  onCompositionUpdate: (event: CompositionEvent<HTMLTextAreaElement>) => void;
  onInput: (value: string) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
};

export const TextEditor = forwardRef<HTMLTextAreaElement, TextEditorProps>(
  function TextEditor(
    {
      defaultValue,
      status,
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
    return (
      <label className="text-editor">
        <span className="text-editor__header">
          <span className="text-editor__label">Text editor</span>
          <span className="editor-status" aria-live="polite">
            {status}
          </span>
        </span>
        <textarea
          className="text-editor__textarea"
          defaultValue={defaultValue}
          aria-label="Text editor"
          placeholder="Start typing..."
          ref={ref}
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
        />
      </label>
    );
  },
);
