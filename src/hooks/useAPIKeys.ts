import { useState, useCallback } from "react";

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  status: "active" | "revoked";
}

export function useAPIKeys() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(false);

  const generateKey = useCallback(async (name: string) => {
    setLoading(true);
    const newKey: APIKey = {
      id: crypto.randomUUID(),
      name,
      key: `sk_${crypto.randomUUID().replace(/-/g, "")}`,
      createdAt: new Date(),
      status: "active"
    };
    setKeys(prev => [...prev, newKey]);
    setLoading(false);
    return newKey;
  }, []);

  const revokeKey = useCallback((id) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: "revoked" as const } : k));
  }, []);

  return { keys, loading, generateKey, revokeKey };
}
