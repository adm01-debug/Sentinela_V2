import { useState, useCallback } from "react";

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function useDrag() {
  const [state, setState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const onDragStart = useCallback((e: React.DragEvent | React.MouseEvent) => {
    setState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
  }, []);

  const onDrag = useCallback(
    (e: React.DragEvent | React.MouseEvent) => {
      if (!state.isDragging) return;
      setState((s) => ({ ...s, currentX: e.clientX, currentY: e.clientY }));
    },
    [state.isDragging]
  );

  const onDragEnd = useCallback(() => {
    setState((s) => ({ ...s, isDragging: false }));
  }, []);

  const deltaX = state.currentX - state.startX;
  const deltaY = state.currentY - state.startY;

  return { ...state, deltaX, deltaY, onDragStart, onDrag, onDragEnd };
}
