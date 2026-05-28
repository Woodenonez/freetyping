export const panelAppearances = ['simple', 'realistic'] as const;
export type PanelAppearance = (typeof panelAppearances)[number];

export const panelSkins = [
  'classic-light',
  'dark-mechanical',
  'natural-wood',
  'high-contrast',
] as const;
export type PanelSkin = (typeof panelSkins)[number];

export const panelAppearanceOptions: Array<{
  id: PanelAppearance;
  label: string;
}> = [
  { id: 'simple', label: 'Simple' },
  { id: 'realistic', label: 'Realistic' },
];

export const panelSkinOptions: Array<{
  id: PanelSkin;
  label: string;
}> = [
  { id: 'classic-light', label: 'Classic light' },
  { id: 'dark-mechanical', label: 'Dark mechanical' },
  { id: 'natural-wood', label: 'Natural wood' },
  { id: 'high-contrast', label: 'High contrast' },
];

export function parsePanelAppearance(value: unknown): PanelAppearance {
  return panelAppearances.includes(value as PanelAppearance)
    ? (value as PanelAppearance)
    : 'simple';
}

export function parsePanelSkin(value: unknown): PanelSkin {
  return panelSkins.includes(value as PanelSkin)
    ? (value as PanelSkin)
    : 'classic-light';
}
