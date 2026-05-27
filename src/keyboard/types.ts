export type VirtualKey = {
  code: string;
  label: string;
  insertText?: string;
  width?: number;
};

export type KeyboardLayout = {
  id: string;
  label: string;
  rows: VirtualKey[][];
};
