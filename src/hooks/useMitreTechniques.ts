import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MitreTechnique {
  id: string;
  tactic: string;
  name: string;
  description: string | null;
  severity_default: string;
  url: string | null;
  enabled: boolean;
}

export function useMitreTechniques() {
  const [techniques, setTechniques] = useState<MitreTechnique[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase
          .from("mitre_techniques")
          .select("*")
          .eq("enabled", true)
          .order("id");
        if (mounted) setTechniques((data as MitreTechnique[]) || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const byId = (id: string) => techniques.find((t) => t.id === id);
  return { techniques, loading, byId };
}
