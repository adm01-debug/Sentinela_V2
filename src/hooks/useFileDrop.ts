import { useState, useCallback, DragEvent } from 'react';

export function useFileDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const onDragOver = useCallback((e: DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setFiles(Array.from(e.dataTransfer.files));
  }, []);

  return { isDragging, files, onDragOver, onDragLeave, onDrop, clearFiles: () => setFiles([]) };
}