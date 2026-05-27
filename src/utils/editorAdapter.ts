export type EditorSelection = {
  start: number;
  end: number;
};

export type EditorAdapter = {
  getValue(): string;
  setValue(value: string): void;
  getSelection(): EditorSelection;
  setSelection(start: number, end: number): void;
  focus(): void;
  insertText(text: string): void;
};

export function createEditorAdapter(textarea: HTMLTextAreaElement): EditorAdapter {
  return {
    getValue() {
      return textarea.value;
    },
    setValue(value) {
      textarea.value = value;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    },
    getSelection() {
      return {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      };
    },
    setSelection(start, end) {
      textarea.setSelectionRange(start, end);
    },
    focus() {
      textarea.focus();
    },
    insertText(text) {
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;

      textarea.setRangeText(text, selectionStart, selectionEnd, 'end');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
    },
  };
}
