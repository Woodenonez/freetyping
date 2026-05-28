import type { EditorAdapter } from '../../utils/editorAdapter';
import type { KeyboardLayout } from '../../keyboard/types';

type VirtualKeyboardProps = {
  activeKeys: Set<string>;
  editor: EditorAdapter | null;
  layout: KeyboardLayout;
};

export function VirtualKeyboard({
  activeKeys,
  editor,
  layout,
}: VirtualKeyboardProps) {
  return (
    <div className="virtual-keyboard" aria-label="Virtual keyboard">
      {layout.rows.map((row, rowIndex) => (
        <div className="virtual-keyboard__row" key={rowIndex}>
          {row.map((key) => {
            const isActive = activeKeys.has(key.code);
            const canInsert = typeof key.insertText === 'string';

            return (
              <button
                className="virtual-key"
                data-active={isActive ? 'true' : 'false'}
                disabled={!canInsert}
                key={key.code}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  if (!canInsert) {
                    return;
                  }

                  editor?.insertText(key.insertText ?? '');
                }}
                style={{ flexGrow: key.width ?? 1 }}
                type="button"
                aria-label={`${key.label} key`}
              >
                {key.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
