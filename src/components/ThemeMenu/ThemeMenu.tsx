import type { Theme } from '../../app/appState';

const themes: Array<{ id: Theme; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'high-contrast', label: 'High contrast' },
];

type ThemeMenuProps = {
  value: Theme;
  onChange: (theme: Theme) => void;
};

export function ThemeMenu({ value, onChange }: ThemeMenuProps) {
  return (
    <details className="menu-control">
      <summary className="menu-control__summary" aria-label="Choose theme">
        Theme
      </summary>
      <div className="menu-control__content" role="menu">
        {themes.map((theme) => (
          <button
            className="menu-control__item"
            data-selected={theme.id === value ? 'true' : 'false'}
            key={theme.id}
            type="button"
            role="menuitemradio"
            aria-checked={theme.id === value}
            onClick={() => onChange(theme.id)}
          >
            {theme.label}
          </button>
        ))}
      </div>
    </details>
  );
}
