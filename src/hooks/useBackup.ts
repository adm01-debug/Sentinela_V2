import { useState, useCallback } from "react";

interface BackupState {
  lastBackup: Date | null;
  status: "idle" | "backing-up" | "restoring" | "error";
  progress: number;
}

export function useBackup() {
  const [state, setState] = useState<BackupState>({
    lastBackup: null,
    status: "idle",
    progress: 0,
  });

  const backup = useCallback(async (data: unknown) => {
    setState((s) => ({ ...s, status: "backing-up", progress: 0 }));

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setState({ lastBackup: new Date(), status: "idle", progress: 100 });
  }, []);

  const restore = useCallback(async (file: File) => {
    setState((s) => ({ ...s, status: "restoring", progress: 0 }));
    const text = await file.text();
    const data = JSON.parse(text);
    setState((s) => ({ ...s, status: "idle", progress: 100 }));
    return data;
  }, []);

  return { ...state, backup, restore };
}
