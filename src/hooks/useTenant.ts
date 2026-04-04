import { useState, useCallback, useEffect } from "react";

interface Tenant { id: string; name: string; slug: string; settings: unknown; }

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = window.location.hostname.split(".")[0];
    setTenant({ id: crypto.randomUUID(), name: slug, slug, settings: {} });
    setLoading(false);
  }, []);

  const updateSettings = useCallback((settings: any) => {
    setTenant(t => t ? { ...t, settings: { ...(t.settings as object), ...settings } } : null);
  }, []);

  return { tenant, loading, updateSettings };
}
