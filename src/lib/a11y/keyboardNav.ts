export const KEYS = {
  TAB: 'Tab',
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

export const handleArrowNavigation = (
  e: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  orientation: 'horizontal' | 'vertical' = 'vertical'
): number => {
  const isVertical = orientation === 'vertical';
  const prevKey = isVertical ? KEYS.ARROW_UP : KEYS.ARROW_LEFT;
  const nextKey = isVertical ? KEYS.ARROW_DOWN : KEYS.ARROW_RIGHT;

  let newIndex = currentIndex;

  if (e.key === prevKey) {
    newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
  } else if (e.key === nextKey) {
    newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
  } else if (e.key === KEYS.HOME) {
    newIndex = 0;
  } else if (e.key === KEYS.END) {
    newIndex = items.length - 1;
  }

  if (newIndex !== currentIndex) {
    e.preventDefault();
    items[newIndex]?.focus();
  }

  return newIndex;
};
