type EditMenuProps = {
  fontSize: number;
  onClearText: () => void;
  onCopyText: () => void;
  onFontSizeChange: (fontSize: number) => void;
};

export function EditMenu({
  fontSize,
  onClearText,
  onCopyText,
  onFontSizeChange,
}: EditMenuProps) {
  const handleFontSizeInput = (value: string) => {
    onFontSizeChange(Number(value));
  };

  return (
    <details className="menu-control">
      <summary className="menu-control__summary" aria-label="Edit actions">
        Edit
      </summary>
      <div className="menu-control__content" role="menu">
        <button
          className="menu-control__item"
          type="button"
          role="menuitem"
          aria-label="Clear editor text"
          onClick={onClearText}
        >
          Clear
        </button>
        <button
          className="menu-control__item"
          type="button"
          role="menuitem"
          aria-label="Copy editor text"
          onClick={onCopyText}
        >
          Copy
        </button>
        <label className="menu-control__item menu-control__number-item">
          <span>Font</span>
          <input
            aria-label="Editor font size"
            max="28"
            min="14"
            type="number"
            value={fontSize}
            onChange={(event) => handleFontSizeInput(event.target.value)}
            onInput={(event) => handleFontSizeInput(event.currentTarget.value)}
          />
        </label>
      </div>
    </details>
  );
}
