export function insertTextAtSelection(params: {
  value: string;
  insertText: string;
  selectionStart: number;
  selectionEnd: number;
}): {
  value: string;
  selectionStart: number;
  selectionEnd: number;
} {
  const { value, insertText, selectionStart, selectionEnd } = params;
  const start = Math.max(0, Math.min(selectionStart, value.length));
  const end = Math.max(start, Math.min(selectionEnd, value.length));
  const nextValue = `${value.slice(0, start)}${insertText}${value.slice(end)}`;
  const nextSelection = start + insertText.length;

  return {
    value: nextValue,
    selectionStart: nextSelection,
    selectionEnd: nextSelection,
  };
}
