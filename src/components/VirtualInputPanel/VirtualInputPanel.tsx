import type { PanelAppearance, PanelSkin } from '../../app/appState';
import type { KeyboardLayout } from '../../keyboard/types';
import type { MouseButtonId } from '../../mouse/types';
import type { EditorAdapter } from '../../utils/editorAdapter';
import { VirtualKeyboard } from './VirtualKeyboard';
import { VirtualMouse } from './VirtualMouse';

type VirtualInputPanelProps = {
  activeKeys: Set<string>;
  activeMouseButtons: Set<MouseButtonId>;
  appearance: PanelAppearance;
  editor: EditorAdapter | null;
  keyboardLayout: KeyboardLayout;
  keyboardVisible: boolean;
  mouseVisible: boolean;
  skin: PanelSkin;
};

export function VirtualInputPanel({
  activeKeys,
  activeMouseButtons,
  appearance,
  editor,
  keyboardLayout,
  keyboardVisible,
  mouseVisible,
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
          editor={editor}
          layout={keyboardLayout}
        />
      ) : null}
      {mouseVisible ? (
        <VirtualMouse activeMouseButtons={activeMouseButtons} />
      ) : null}
    </div>
  );
}
