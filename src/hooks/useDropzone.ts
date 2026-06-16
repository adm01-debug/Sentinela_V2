import { useState, useCallback } from "react";

export function useDropzone(onFiles: (files: File[]) => void, accept?: string[]) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      let files = Array.from(e.dataTransfer.files);
      if (accept?.length) {
        files = files.filter((f) => accept.some((a) => f.type.match(a)));
      }
      onFiles(files);
    },
    [onFiles, accept]
  );

  return {
    isDragging,
    dropzoneProps: {
      onDragEnter: handleDragEnter,
      onDragOver: (e: React.DragEvent) => e.preventDefault(),
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
