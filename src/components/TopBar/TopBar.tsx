import { FileMenu } from '../FileMenu/FileMenu';
import { InputModeSelector } from '../InputModeSelector/InputModeSelector';
import { PanelMenu } from '../PanelMenu/PanelMenu';
import { ThemeMenu } from '../ThemeMenu/ThemeMenu';
import type { Theme } from '../../app/appState';

type TopBarProps = {
  inputModeId: string;
  onInputModeChange: (inputModeId: string) => void;
  keyboardVisible: boolean;
  mouseVisible: boolean;
  onKeyboardVisibleChange: (visible: boolean) => void;
  onMouseVisibleChange: (visible: boolean) => void;
  onClearText: () => void;
  onCopyText: () => void;
  onClearSavedText: () => void;
  onExportText: () => void;
  onImportText: (file: File) => void;
  saveTextLocally: boolean;
  onToggleSaveTextLocally: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  fontSize: number;
  onFontSizeChange: (fontSize: number) => void;
};

export function TopBar({
  inputModeId,
  onInputModeChange,
  keyboardVisible,
  mouseVisible,
  onKeyboardVisibleChange,
  onMouseVisibleChange,
  onClearText,
  onCopyText,
  onClearSavedText,
  onExportText,
  onImportText,
  saveTextLocally,
  onToggleSaveTextLocally,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
}: TopBarProps) {
  const handleFontSizeInput = (value: string) => {
    onFontSizeChange(Number(value));
  };

  return (
    <header className="top-bar">
      <div className="top-bar__brand" aria-label="FreeTyping app">
        FreeTyping
      </div>

      <nav className="top-bar__controls" aria-label="Editor controls">
        <InputModeSelector value={inputModeId} onChange={onInputModeChange} />
        <FileMenu
          onClearSavedText={onClearSavedText}
          onExportText={onExportText}
          onImportText={onImportText}
          saveTextLocally={saveTextLocally}
          onToggleSaveTextLocally={onToggleSaveTextLocally}
        />

        <PanelMenu
          keyboardVisible={keyboardVisible}
          mouseVisible={mouseVisible}
          onKeyboardVisibleChange={onKeyboardVisibleChange}
          onMouseVisibleChange={onMouseVisibleChange}
        />
        <button type="button" aria-label="Clear editor text" onClick={onClearText}>
          Clear
        </button>
        <button type="button" aria-label="Copy editor text" onClick={onCopyText}>
          Copy
        </button>
        <label className="field field--compact">
          <span className="field__label">Font</span>
          <input
            aria-label="Editor font size"
            max="28"
            min="14"
            type="number"
            value={fontSize}
            onChange={(event) => handleFontSizeInput(event.target.value)}
            onInput={(event) =>
              handleFontSizeInput(event.currentTarget.value)
            }
          />
        </label>
        <ThemeMenu value={theme} onChange={onThemeChange} />
        <details className="help-menu">
          <summary className="help-menu__summary" aria-label="Keyboard help">
            Help
          </summary>
          <div className="help-menu__content">
            <p>Chinese Pinyin</p>
            <ul>
              <li>Letters build the buffer.</li>
              <li>Space commits the selected candidate.</li>
              <li>Number keys select candidates.</li>
              <li>Arrow keys move candidate selection.</li>
              <li>Backspace edits the buffer.</li>
              <li>Escape cancels the buffer.</li>
            </ul>
          </div>
        </details>
      </nav>
    </header>
  );
}
