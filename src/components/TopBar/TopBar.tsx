import { EditMenu } from '../EditMenu/EditMenu';
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
  onExportText: () => void;
  onImportText: (file: File) => void;
  saveTextLocally: boolean;
  onSaveTextLocallyChange: (saveTextLocally: boolean) => void;
  pinyinShowPageCount: boolean;
  pinyinFuzzyMatching: boolean;
  onPinyinShowPageCountChange: (showPageCount: boolean) => void;
  onPinyinFuzzyMatchingChange: (fuzzyMatching: boolean) => void;
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
  onExportText,
  onImportText,
  saveTextLocally,
  onSaveTextLocallyChange,
  pinyinShowPageCount,
  pinyinFuzzyMatching,
  onPinyinShowPageCountChange,
  onPinyinFuzzyMatchingChange,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar__brand" aria-label="FreeTyping app">
        <span>FreeTyping</span>
        <span
          className="save-status-icon"
          data-saved={saveTextLocally ? 'true' : 'false'}
          aria-label={saveTextLocally ? 'Text saving enabled' : 'Text saving disabled'}
          role="img"
        />
      </div>

      <nav className="top-bar__controls" aria-label="Editor controls">
        <FileMenu
          onExportText={onExportText}
          onImportText={onImportText}
          saveTextLocally={saveTextLocally}
          onSaveTextLocallyChange={onSaveTextLocallyChange}
        />
        <EditMenu
          fontSize={fontSize}
          onClearText={onClearText}
          onCopyText={onCopyText}
          onFontSizeChange={onFontSizeChange}
        />
        <span className="top-bar__divider" aria-hidden="true" />
        <InputModeSelector
          pinyinShowPageCount={pinyinShowPageCount}
          pinyinFuzzyMatching={pinyinFuzzyMatching}
          value={inputModeId}
          onChange={onInputModeChange}
          onPinyinShowPageCountChange={onPinyinShowPageCountChange}
          onPinyinFuzzyMatchingChange={onPinyinFuzzyMatchingChange}
        />
        <PanelMenu
          keyboardVisible={keyboardVisible}
          mouseVisible={mouseVisible}
          onKeyboardVisibleChange={onKeyboardVisibleChange}
          onMouseVisibleChange={onMouseVisibleChange}
        />
        <span className="top-bar__divider" aria-hidden="true" />
        <ThemeMenu value={theme} onChange={onThemeChange} />
      </nav>
    </header>
  );
}
