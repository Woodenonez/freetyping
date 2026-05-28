import { inputModes } from '../../input/inputManager';

type InputModeSelectorProps = {
  pinyinShowPageCount: boolean;
  pinyinFuzzyMatching: boolean;
  value: string;
  onChange: (inputModeId: string) => void;
  onPinyinShowPageCountChange: (showPageCount: boolean) => void;
  onPinyinFuzzyMatchingChange: (fuzzyMatching: boolean) => void;
};

export function InputModeSelector({
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
        {currentMode.id === 'zh-pinyin' ? (
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
