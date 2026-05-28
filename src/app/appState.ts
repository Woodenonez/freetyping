import type { PanelAppearance, PanelSkin } from './panelAppearance';
import type { KeyboardLayoutId } from '../keyboard/layouts';

export type Theme = 'light' | 'dark' | 'high-contrast';
export type { PanelAppearance, PanelSkin } from './panelAppearance';
export type { KeyboardLayoutId } from '../keyboard/layouts';

export type AppState = {
  inputModeId: string;
  keyboardVisible: boolean;
  mouseVisible: boolean;
  keyboardLayoutId: KeyboardLayoutId;
  panelAppearance: PanelAppearance;
  panelSkin: PanelSkin;
  activeKeys: Set<string>;
  activeMouseButtons: Set<string>;
  theme: Theme;
  fontSize: number;
  saveTextLocally: boolean;
  pinyinShowPageCount: boolean;
  pinyinFuzzyMatching: boolean;
};

export const STORAGE_KEYS = {
  text: 'freetyping:text',
  inputModeId: 'freetyping:inputModeId',
  keyboardVisible: 'freetyping:keyboardVisible',
  mouseVisible: 'freetyping:mouseVisible',
  keyboardLayoutId: 'freetyping:keyboardLayoutId',
  panelAppearance: 'freetyping:panelAppearance',
  panelSkin: 'freetyping:panelSkin',
  theme: 'freetyping:theme',
  fontSize: 'freetyping:fontSize',
  saveTextLocally: 'freetyping:saveTextLocally',
  pinyinShowPageCount: 'freetyping:pinyinShowPageCount',
  pinyinFuzzyMatching: 'freetyping:pinyinFuzzyMatching',
} as const;
