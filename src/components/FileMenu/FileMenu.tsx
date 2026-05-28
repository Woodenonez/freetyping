type FileMenuProps = {
  onExportText: () => void;
  onImportText: (file: File) => void;
  saveTextLocally: boolean;
  onSaveTextLocallyChange: (saveTextLocally: boolean) => void;
};

export function FileMenu({
  onExportText,
  onImportText,
  saveTextLocally,
  onSaveTextLocallyChange,
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
            aria-label="Save text"
            checked={saveTextLocally}
            type="checkbox"
            onChange={(event) =>
              onSaveTextLocallyChange(event.currentTarget.checked)
            }
          />
          <span>Save text</span>
        </label>
        <div className="menu-control__divider" role="separator" />
        <details className="menu-control__nested">
          <summary aria-label="Help">Help</summary>
          <div className="menu-control__help" role="note">
            <p>Chinese Pinyin</p>
            <ul>
              <li>Letters build the buffer.</li>
              <li>Space commits the selected candidate.</li>
              <li>Number keys select candidates.</li>
              <li>Arrow keys move candidate selection.</li>
              <li>Fuzzy matching is optional in Input Mode.</li>
              <li>Punctuation keys insert Chinese punctuation.</li>
              <li>Backspace edits the buffer.</li>
              <li>Escape cancels the buffer.</li>
            </ul>
          </div>
        </details>
      </div>
    </details>
  );
}
