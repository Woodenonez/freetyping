import type { PanelAppearance, PanelSkin } from '../../app/appState';
import type { KeyboardLayout, VirtualKey } from '../../keyboard/types';
import type { MouseButtonId } from '../../mouse/types';
import { VirtualKeyboard } from './VirtualKeyboard';
import { VirtualMouse } from './VirtualMouse';

type VirtualInputPanelProps = {
  activeKeys: Set<string>;
  activeMouseButtons: Set<MouseButtonId>;
  appearance: PanelAppearance;
  keyboardLayout: KeyboardLayout;
  keyboardVisible: boolean;
  mouseVisible: boolean;
  onVirtualKeyPress: (key: VirtualKey) => void;
  skin: PanelSkin;
};

export function VirtualInputPanel({
  activeKeys,
  activeMouseButtons,
  appearance,
  keyboardLayout,
  keyboardVisible,
  mouseVisible,
  onVirtualKeyPress,
  skin,
}: VirtualInputPanelProps) {
  return (
    <div
      className="virtual-input-panel"
      data-appearance={appearance}
      data-skin={appearance === 'realistic' ? skin : 'none'}
    >
      {keyboardVisible ? (
        <VirtualKeyboard
          activeKeys={activeKeys}
          layout={keyboardLayout}
          onKeyPress={onVirtualKeyPress}
        />
      ) : null}
      {mouseVisible ? (
        <VirtualMouse activeMouseButtons={activeMouseButtons} />
      ) : null}
    </div>
  );
}
