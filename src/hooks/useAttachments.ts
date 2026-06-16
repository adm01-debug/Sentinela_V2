import { useState, useCallback } from "react";

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export function useAttachments(maxFiles = 10, maxSize = 10 * 1024 * 1024) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  const add = useCallback(
    async (file: File) => {
      if (attachments.length >= maxFiles) throw new Error("Max files reached");
      if (file.size > maxSize) throw new Error("File too large");

      setUploading(true);
      const attachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
      };
      setAttachments((prev) => [...prev, attachment]);
      setUploading(false);
      return attachment;
    },
    [attachments.length, maxFiles, maxSize]
  );

  const remove = useCallback((id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id);
      if (att) URL.revokeObjectURL(att.url);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    attachments.forEach((a) => URL.revokeObjectURL(a.url));
    setAttachments([]);
  }, [attachments]);

  return { attachments, uploading, add, remove, clear };
}
