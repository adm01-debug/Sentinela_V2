import { useState, useCallback } from 'react';

export interface ChartAnnotation {
  id: string;
  type: 'point' | 'line' | 'area' | 'text';
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  text?: string;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  visible?: boolean;
}

export interface UseChartAnnotationsOptions {
  initialAnnotations?: ChartAnnotation[];
  onAnnotationAdd?: (annotation: ChartAnnotation) => void;
  onAnnotationRemove?: (id: string) => void;
}

export function useChartAnnotations(options: UseChartAnnotationsOptions = {}) {
  const { initialAnnotations = [], onAnnotationAdd, onAnnotationRemove } = options;
  const [annotations, setAnnotations] = useState<ChartAnnotation[]>(initialAnnotations);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addAnnotation = useCallback((annotation: Omit<ChartAnnotation, 'id'>) => {
    const newAnnotation: ChartAnnotation = { ...annotation, id: crypto.randomUUID(), visible: true };
    setAnnotations(prev => [...prev, newAnnotation]);
    onAnnotationAdd?.(newAnnotation);
    return newAnnotation.id;
  }, [onAnnotationAdd]);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (selectedId === id) setSelectedId(null);
    onAnnotationRemove?.(id);
  }, [selectedId, onAnnotationRemove]);

  const updateAnnotation = useCallback((id: string, updates: Partial<ChartAnnotation>) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, visible: !a.visible } : a));
  }, []);

  const clearAll = useCallback(() => {
    setAnnotations([]);
    setSelectedId(null);
  }, []);

  const visibleAnnotations = annotations.filter(a => a.visible !== false);

  return { annotations, visibleAnnotations, selectedId, setSelectedId, addAnnotation, removeAnnotation, updateAnnotation, toggleVisibility, clearAll };
}

export default useChartAnnotations;
