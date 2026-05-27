import { STORAGE_KEYS } from '../app/appState';

export function getInitialEditorText(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const shouldRestoreText =
    window.localStorage.getItem(STORAGE_KEYS.saveTextLocally) === 'true';

  if (!shouldRestoreText) {
    return '';
  }

  return window.localStorage.getItem(STORAGE_KEYS.text) ?? '';
}

export function saveEditorText(text: string): void {
  window.localStorage.setItem(STORAGE_KEYS.text, text);
}

export function clearSavedEditorText(): void {
  window.localStorage.removeItem(STORAGE_KEYS.text);
}
