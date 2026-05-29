import type { KeyboardLayout } from '../../keyboard/types';
import type { VirtualKey } from '../../keyboard/types';

type VirtualKeyboardProps = {
  activeKeys: Set<string>;
  layout: KeyboardLayout;
  onKeyPress: (key: VirtualKey) => void;
};

export function VirtualKeyboard({
  activeKeys,
  layout,
  onKeyPress,
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

                  onKeyPress(key);
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
