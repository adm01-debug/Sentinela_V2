import { useState, useCallback, useRef } from "react";

export function useImageUpload(maxSize = 5 * 1024 * 1024) {
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }
    if (file.size > maxSize) {
      setError("Image too large");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    setError(null);
  }, [maxSize]);

  const openPicker = useCallback(() => inputRef.current?.click(), []);
  const clear = useCallback(() => { setImage(null); setError(null); }, []);

  return { image, error, inputRef, handleFile, openPicker, clear };
}
