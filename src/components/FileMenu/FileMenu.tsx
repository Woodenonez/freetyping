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
          <summary aria-label="About">About</summary>
          <div className="menu-control__help" role="note">
            <p>FreeTyping</p>
            <p>
              A typing workspace for pure text editing, keyboard
              feedback, and browser-based input methods.
            </p>
          </div>
        </details>
        <details className="menu-control__nested">
          <summary aria-label="Help">Help</summary>
          <div className="menu-control__help" role="note">
            <p>Input</p>
            <ul>
              <li>System Input uses your browser and operating system.</li>
              <li>Overlay Input uses the selected panel layout.</li>
              <li>Panel layouts change the virtual keyboard and overlay behavior.</li>
              <li>Virtual keys insert the character shown by the active layout.</li>
            </ul>
          </div>
        </details>
      </div>
    </details>
  );
}
