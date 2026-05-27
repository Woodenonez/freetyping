import type { MouseButtonId } from '../../mouse/types';

const mouseButtons: Array<{ id: MouseButtonId; label: string }> = [
  { id: 'left', label: 'Left' },
  { id: 'middle', label: 'Middle' },
  { id: 'right', label: 'Right' },
];

type VirtualMouseProps = {
  activeMouseButtons: Set<MouseButtonId>;
};

export function VirtualMouse({ activeMouseButtons }: VirtualMouseProps) {
  return (
    <div className="virtual-mouse" aria-label="Virtual mouse">
      {mouseButtons.map((button) => (
        <div
          className="virtual-mouse__button"
          data-active={activeMouseButtons.has(button.id) ? 'true' : 'false'}
          key={button.id}
        >
          {button.label}
        </div>
      ))}
    </div>
  );
}
