export type VirtualKey = {
  code: string;
  label: string;
  insertText?: string;
  shiftedText?: string;
  width?: number;
};

export type KeyboardLayout = {
  id: string;
  label: string;
  countryCodes?: string[];
  rows: VirtualKey[][];
};
