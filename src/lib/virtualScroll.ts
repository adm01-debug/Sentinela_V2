export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const calculateVisibleRange = (
  scrollTop: number,
  totalItems: number,
  options: VirtualScrollOptions
) => {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  return { startIndex, endIndex };
};
