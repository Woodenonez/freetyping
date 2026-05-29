import { inputModes } from '../../input/inputManager';
import type { AppInputModeId } from '../../app/appState';

type InputModeSelectorProps = {
  isPinyinLayoutActive: boolean;
  pinyinShowPageCount: boolean;
  pinyinFuzzyMatching: boolean;
  value: AppInputModeId;
  onChange: (inputModeId: AppInputModeId) => void;
  onPinyinShowPageCountChange: (showPageCount: boolean) => void;
  onPinyinFuzzyMatchingChange: (fuzzyMatching: boolean) => void;
};

export function InputModeSelector({
  isPinyinLayoutActive,
  pinyinShowPageCount,
  pinyinFuzzyMatching,
  value,
  onChange,
  onPinyinShowPageCountChange,
  onPinyinFuzzyMatchingChange,
}: InputModeSelectorProps) {
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
          onClick={() => onChange(systemMode.id as AppInputModeId)}
        >
          {systemMode.label}
        </button>
        {webModes.map((mode) => (
          <button
            className="menu-control__item"
            data-selected={currentMode.id === mode.id ? 'true' : 'false'}
            key={mode.id}
            type="button"
            role="menuitemradio"
            aria-checked={currentMode.id === mode.id}
            onClick={() => onChange(mode.id as AppInputModeId)}
          >
            {mode.label}
          </button>
        ))}
        {currentMode.id === 'overlay' && isPinyinLayoutActive ? (
          <>
            <div className="menu-control__divider" role="separator" />
            <label className="menu-control__item menu-control__checkbox-item">
              <input
                aria-label="Show Pinyin page count"
                checked={pinyinShowPageCount}
                type="checkbox"
                onChange={(event) =>
                  onPinyinShowPageCountChange(event.currentTarget.checked)
                }
              />
              <span>Show page count</span>
            </label>
            <label className="menu-control__item menu-control__checkbox-item">
              <input
                aria-label="Use fuzzy Pinyin matching"
                checked={pinyinFuzzyMatching}
                type="checkbox"
                onChange={(event) =>
                  onPinyinFuzzyMatchingChange(event.currentTarget.checked)
                }
              />
              <span>Fuzzy matching</span>
            </label>
          </>
        ) : null}
      </div>
    </details>
  );
}
