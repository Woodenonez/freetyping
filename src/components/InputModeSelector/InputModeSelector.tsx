import { inputModes } from '../../input/inputManager';

type InputModeSelectorProps = {
  value: string;
  onChange: (inputModeId: string) => void;
};

export function InputModeSelector({ value, onChange }: InputModeSelectorProps) {
  const [systemMode, ...webModes] = inputModes;
  const currentMode = inputModes.find((mode) => mode.id === value) ?? systemMode;

  return (
    <details className="menu-control">
      <summary className="menu-control__summary" aria-label="Choose input mode">
        Input Mode
      </summary>
      <div className="menu-control__content" role="menu">
        <button
          className="menu-control__item"
          data-selected={currentMode.id === systemMode.id ? 'true' : 'false'}
          type="button"
          role="menuitemradio"
          aria-checked={currentMode.id === systemMode.id}
          onClick={() => onChange(systemMode.id)}
        >
          {systemMode.label}
        </button>
        <div className="menu-control__divider" role="separator" />
        {webModes.map((mode) => (
          <button
            className="menu-control__item"
            data-selected={currentMode.id === mode.id ? 'true' : 'false'}
            key={mode.id}
            type="button"
            role="menuitemradio"
            aria-checked={currentMode.id === mode.id}
            onClick={() => onChange(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </details>
  );
}
