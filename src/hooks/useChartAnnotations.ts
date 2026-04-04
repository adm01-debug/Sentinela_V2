import { useState, useCallback } from 'react';

export interface ChartAnnotation {
  id: string;
  type: 'line' | 'area' | 'point' | 'text';
  x?: number | string;
  y?: number;
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
  label?: string;
  color?: string;
  strokeDasharray?: string;
}

export function useChartAnnotations(initialAnnotations: ChartAnnotation[] = []) {
  const [annotations, setAnnotations] = useState<ChartAnnotation[]>(initialAnnotations);

  const addAnnotation = useCallback((annotation: Omit<ChartAnnotation, 'id'>) => {
    const newAnnotation = { ...annotation, id: crypto.randomUUID() };
    setAnnotations(prev => [...prev, newAnnotation]);
    return newAnnotation.id;
  }, []);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  }, []);

  const updateAnnotation = useCallback((id: string, updates: Partial<ChartAnnotation>) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const clearAnnotations = useCallback(() => setAnnotations([]), []);

  const addThresholdLine = useCallback((y, label: string, color = '#ef4444') => {
    return addAnnotation({ type: 'line', y, label, color, strokeDasharray: '5,5' });
  }, [addAnnotation]);

  const addReferenceArea = useCallback((x1, x2, label: string, color = 'rgba(59, 130, 246, 0.1)') => {
    return addAnnotation({ type: 'area', x1, x2, label, color });
  }, [addAnnotation]);

  return { annotations, addAnnotation, removeAnnotation, updateAnnotation, clearAnnotations, addThresholdLine, addReferenceArea };
}

export default useChartAnnotations;
