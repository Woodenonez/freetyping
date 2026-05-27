type FileMenuProps = {
  onClearSavedText: () => void;
  onExportText: () => void;
  onImportText: (file: File) => void;
  saveTextLocally: boolean;
  onToggleSaveTextLocally: () => void;
};

export function FileMenu({
  onClearSavedText,
  onExportText,
  onImportText,
  saveTextLocally,
  onToggleSaveTextLocally,
}: FileMenuProps) {
  return (
    <details className="menu-control">
      <summary className="menu-control__summary" aria-label="File actions">
        File
      </summary>
      <div className="menu-control__content" role="menu">
        <label className="menu-control__item menu-control__file-item">
          <span>Import</span>
          <input
            accept=".txt,text/plain"
            aria-label="Import text file"
            type="file"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';

              if (file) {
                onImportText(file);
              }
            }}
          />
        </label>
        <button
          className="menu-control__item"
          type="button"
          role="menuitem"
          aria-label="Export editor text"
          onClick={onExportText}
        >
          Export
        </button>
        <label className="menu-control__item menu-control__checkbox-item">
          <input
            checked={saveTextLocally}
            type="checkbox"
            onChange={onToggleSaveTextLocally}
          />
          <span>Save text</span>
        </label>
        <button
          className="menu-control__item"
          type="button"
          role="menuitem"
          aria-label="Clear saved editor text"
          onClick={onClearSavedText}
        >
          Clear Saved
        </button>
      </div>
    </details>
  );
}
