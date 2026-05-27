type PanelMenuProps = {
  keyboardVisible: boolean;
  mouseVisible: boolean;
  onKeyboardVisibleChange: (visible: boolean) => void;
  onMouseVisibleChange: (visible: boolean) => void;
};

export function PanelMenu({
  keyboardVisible,
  mouseVisible,
  onKeyboardVisibleChange,
  onMouseVisibleChange,
}: PanelMenuProps) {
  const enabledCount = Number(keyboardVisible) + Number(mouseVisible);

  return (
    <details className="panel-menu">
      <summary
        className="panel-menu__summary"
        aria-label="Choose visible input panels"
      >
        Panel {enabledCount}/2
      </summary>
      <div className="panel-menu__content">
        <label className="toggle-field">
          <input
            aria-label="Show keyboard panel"
            checked={keyboardVisible}
            type="checkbox"
            onChange={(event) =>
              onKeyboardVisibleChange(event.currentTarget.checked)
            }
          />
          <span>Keyboard</span>
        </label>
        <label className="toggle-field">
          <input
            aria-label="Show mouse panel"
            checked={mouseVisible}
            type="checkbox"
            onChange={(event) =>
              onMouseVisibleChange(event.currentTarget.checked)
            }
          />
          <span>Mouse</span>
        </label>
      </div>
    </details>
  );
}
