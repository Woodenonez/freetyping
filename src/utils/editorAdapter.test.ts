// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEditorAdapter } from './editorAdapter';

describe('createEditorAdapter', () => {
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    textarea = document.createElement('textarea');
    document.body.append(textarea);
  });

  it('reads and writes value', () => {
    const adapter = createEditorAdapter(textarea);
    const handleInput = vi.fn();
    textarea.addEventListener('input', handleInput);

    adapter.setValue('hello');

    expect(adapter.getValue()).toBe('hello');
    expect(handleInput).toHaveBeenCalledTimes(1);
  });

  it('reads and writes selection', () => {
    const adapter = createEditorAdapter(textarea);
    textarea.value = 'hello';

    adapter.setSelection(1, 4);

    expect(adapter.getSelection()).toEqual({ start: 1, end: 4 });
  });

  it('inserts text at the current selection and emits input', () => {
    const adapter = createEditorAdapter(textarea);
    const handleInput = vi.fn();
    textarea.addEventListener('input', handleInput);
    textarea.value = 'abc';
    textarea.setSelectionRange(1, 3);

    adapter.insertText('x');

    expect(textarea.value).toBe('ax');
    expect(adapter.getSelection()).toEqual({ start: 2, end: 2 });
    expect(handleInput).toHaveBeenCalledTimes(1);
  });
});
