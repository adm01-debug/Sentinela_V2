import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CommandSearchResultType = "employee" | "violation" | "activity";

export interface CommandSearchResult {
  id: string;
  type: CommandSearchResultType;
  title: string;
  description: string;
}

interface Resposta {
  termo: string;
  results: CommandSearchResult[];
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;
const MAX_RESULTS = 6;

export const PATH_BY_RESULT_TYPE: Record<CommandSearchResultType, (id: string) => string> = {
  employee: (id) => `/employees/${id}`,
  violation: () => "/violations",
  activity: (id) => `/activities/${id}`,
};

function normalizar(bruto: unknown): CommandSearchResult | null {
  if (!bruto || typeof bruto !== "object") return null;
  const { id, type, title, description } = bruto as Record<string, unknown>;
  if (typeof id !== "string" || typeof type !== "string" || typeof title !== "string") return null;
  if (!(type in PATH_BY_RESULT_TYPE)) return null;
  return {
    id,
    type: type as CommandSearchResultType,
    title,
    description: typeof description === "string" ? description : "",
  };
}

/** Busca funcionários, violações e atividades para a paleta de comandos. */
export function useCommandSearch(query: string) {
  const termo = query.trim();
  const buscaAtiva = termo.length >= MIN_QUERY_LENGTH;
  const [resposta, setResposta] = useState<Resposta>({ termo: "", results: [] });

  useEffect(() => {
    if (!buscaAtiva) return;

    let cancelado = false;

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const { data, error } = await supabase.functions.invoke("natural-language-query", {
            body: { query: termo, maxResults: MAX_RESULTS },
          });
          if (cancelado) return;
          if (error) throw error;
          const bruto = (data as { results?: unknown } | null)?.results;
          const lista = Array.isArray(bruto) ? bruto : [];
          setResposta({
            termo,
            results: lista.map(normalizar).filter((r): r is CommandSearchResult => r !== null),
          });
        } catch {
          if (!cancelado) setResposta({ termo, results: [] });
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [termo, buscaAtiva]);

  const atual = resposta.termo === termo ? resposta.results : [];

  return { results: buscaAtiva ? atual : [], loading: buscaAtiva && resposta.termo !== termo };
}
