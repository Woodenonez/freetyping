import type { MouseButtonId } from '../../mouse/types';
import type { EditorAdapter } from '../../utils/editorAdapter';
import { VirtualKeyboard } from './VirtualKeyboard';
import { VirtualMouse } from './VirtualMouse';

type VirtualInputPanelProps = {
  activeKeys: Set<string>;
  activeMouseButtons: Set<MouseButtonId>;
  editor: EditorAdapter | null;
  keyboardVisible: boolean;
  mouseVisible: boolean;
};

export function VirtualInputPanel({
  activeKeys,
  activeMouseButtons,
  editor,
  keyboardVisible,
  mouseVisible,
}: VirtualInputPanelProps) {
  return (
    <div className="virtual-input-panel">
      {keyboardVisible ? (
        <VirtualKeyboard activeKeys={activeKeys} editor={editor} />
      ) : null}
      {mouseVisible ? (
        <VirtualMouse activeMouseButtons={activeMouseButtons} />
      ) : null}
    </div>
  );
}
