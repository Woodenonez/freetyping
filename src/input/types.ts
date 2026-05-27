export type InputContext = {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  isComposing: boolean;
};

export type InputResult = {
  insertText?: string;
  text?: string;
  selectionStart?: number;
  selectionEnd?: number;
  handled: boolean;
  preventDefault?: boolean;
};

export type InputMode = {
  id: string;
  label: string;
  language?: string;
  description?: string;
  onBeforeInput?: (event: InputEvent, context: InputContext) => InputResult | null;
  onKeyDown?: (event: KeyboardEvent, context: InputContext) => InputResult | null;
  onCompositionStart?: (
    event: CompositionEvent,
    context: InputContext,
  ) => void;
  onCompositionUpdate?: (
    event: CompositionEvent,
    context: InputContext,
  ) => void;
  onCompositionEnd?: (
    event: CompositionEvent,
    context: InputContext,
  ) => InputResult | null;
};
