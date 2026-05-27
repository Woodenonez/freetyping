export type Theme = 'light' | 'dark' | 'high-contrast';

export type AppState = {
  inputModeId: string;
  keyboardVisible: boolean;
  mouseVisible: boolean;
  activeKeys: Set<string>;
  activeMouseButtons: Set<string>;
  theme: Theme;
  fontSize: number;
  saveTextLocally: boolean;
};

export const STORAGE_KEYS = {
  text: 'freetyping:text',
  inputModeId: 'freetyping:inputModeId',
  keyboardVisible: 'freetyping:keyboardVisible',
  mouseVisible: 'freetyping:mouseVisible',
  theme: 'freetyping:theme',
  fontSize: 'freetyping:fontSize',
  saveTextLocally: 'freetyping:saveTextLocally',
} as const;
