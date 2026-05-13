import { useCallback, useState } from "react";

export function useDownload() {
  const [downloading, setDownloading] = useState(false);

  const download = useCallback(async (url: string, filename?: string) => {
    setDownloading(true);
    try {
      const response = await fetch(url: string);
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename || url.split("/").pop() || "download";
      a.click();
      URL.revokeObjectURL(href);
    } finally {
      setDownloading(false);
    }
  }, []);

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
  }, []);

  return { downloading, download, downloadBlob };
}
