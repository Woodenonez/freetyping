export type MouseButtonId = 'left' | 'middle' | 'right';

export function getMouseButtonId(button: number): MouseButtonId | null {
  if (button === 0) {
    return 'left';
  }

  if (button === 1) {
    return 'middle';
  }

  if (button === 2) {
    return 'right';
  }

  return null;
}
