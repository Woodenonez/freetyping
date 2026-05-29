import {
  panelAppearanceOptions,
  panelSkinOptions,
  type PanelAppearance,
  type PanelSkin,
} from '../../app/panelAppearance';
import {
  generalKeyboardLayouts,
  nordicKeyboardLayouts,
  type KeyboardLayoutId,
} from '../../keyboard/layouts';

type PanelMenuProps = {
  keyboardVisible: boolean;
  keyboardLayoutId: KeyboardLayoutId;
  mouseVisible: boolean;
  panelAppearance: PanelAppearance;
  panelSkin: PanelSkin;
  onKeyboardVisibleChange: (visible: boolean) => void;
  onKeyboardLayoutChange: (layoutId: KeyboardLayoutId) => void;
  onMouseVisibleChange: (visible: boolean) => void;
  onPanelAppearanceChange: (appearance: PanelAppearance) => void;
  onPanelSkinChange: (skin: PanelSkin) => void;
};

export function PanelMenu({
  keyboardVisible,
  keyboardLayoutId,
  mouseVisible,
  panelAppearance,
  panelSkin,
  onKeyboardVisibleChange,
  onKeyboardLayoutChange,
  onMouseVisibleChange,
  onPanelAppearanceChange,
  onPanelSkinChange,
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
        <div className="menu-control__divider" role="separator" />
        <div className="panel-menu__group" role="group" aria-label="Keyboard layout">
          <span className="panel-menu__group-label">Layout</span>
          <span className="panel-menu__subgroup-label">General</span>
          {generalKeyboardLayouts.map((layout) => (
            <button
              className="menu-control__item"
              data-selected={layout.id === keyboardLayoutId ? 'true' : 'false'}
              disabled={!keyboardVisible}
              key={layout.id}
              type="button"
              role="menuitemradio"
              aria-checked={layout.id === keyboardLayoutId}
              onClick={() => onKeyboardLayoutChange(layout.id as KeyboardLayoutId)}
            >
              {layout.label}
            </button>
          ))}
          <span className="panel-menu__subgroup-label">Nordic</span>
          {nordicKeyboardLayouts.map((layout) => (
            <button
              className="menu-control__item"
              data-selected={layout.id === keyboardLayoutId ? 'true' : 'false'}
              disabled={!keyboardVisible}
              key={layout.id}
              type="button"
              role="menuitemradio"
              aria-checked={layout.id === keyboardLayoutId}
              onClick={() => onKeyboardLayoutChange(layout.id as KeyboardLayoutId)}
            >
              {layout.label}
            </button>
          ))}
        </div>
        <div className="menu-control__divider" role="separator" />
        <div className="panel-menu__group" role="group" aria-label="Panel appearance">
          <span className="panel-menu__group-label">Appearance</span>
          {panelAppearanceOptions.map((appearance) => (
            <button
              className="menu-control__item"
              data-selected={appearance.id === panelAppearance ? 'true' : 'false'}
              key={appearance.id}
              type="button"
              role="menuitemradio"
              aria-checked={appearance.id === panelAppearance}
              onClick={() => onPanelAppearanceChange(appearance.id)}
            >
              {appearance.label}
            </button>
          ))}
        </div>
        {panelAppearance === 'realistic' ? (
          <>
            <div className="menu-control__divider" role="separator" />
            <div className="panel-menu__group" role="group" aria-label="Panel skin">
              <span className="panel-menu__group-label">Skin</span>
              {panelSkinOptions.map((skin) => (
                <button
                  className="menu-control__item"
                  data-selected={skin.id === panelSkin ? 'true' : 'false'}
                  key={skin.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={skin.id === panelSkin}
                  onClick={() => onPanelSkinChange(skin.id)}
                >
                  {skin.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </details>
  );
}
