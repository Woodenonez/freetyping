import type { EditorAdapter } from '../utils/editorAdapter';
import { chinesePinyinInputMode } from './modes/chinesePinyin';
import { englishDirectInputMode } from './modes/englishDirect';
import { systemInputMode } from './modes/systemInput';
import type { InputContext, InputMode, InputResult } from './types';

export const inputModes = [
  systemInputMode,
  englishDirectInputMode,
  chinesePinyinInputMode,
] satisfies InputMode[];

export function getInputMode(inputModeId: string): InputMode {
  return inputModes.find((mode) => mode.id === inputModeId) ?? systemInputMode;
}

export function createInputContext(
  editor: EditorAdapter,
  isComposing: boolean,
): InputContext {
  const selection = editor.getSelection();

  return {
    text: editor.getValue(),
    selectionStart: selection.start,
    selectionEnd: selection.end,
    isComposing,
  };
}

export function applyInputResult(
  editor: EditorAdapter,
  result: InputResult | null | undefined,
): boolean {
  if (!result?.handled) {
    return false;
  }

  if (typeof result.insertText === 'string') {
    editor.insertText(result.insertText);
  }

  if (typeof result.text === 'string') {
    editor.setValue(result.text);
  }

  if (
    typeof result.selectionStart === 'number' &&
    typeof result.selectionEnd === 'number'
  ) {
    editor.setSelection(result.selectionStart, result.selectionEnd);
  }

  return Boolean(result.preventDefault);
}
