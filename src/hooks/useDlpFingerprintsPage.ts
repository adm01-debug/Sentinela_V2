import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryPresets } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Fingerprinting de documentos sigilosos (Exact Data Match, roadmap DLP F3).
 *
 * `dlp_fingerprints` existe com RLS admin por empresa desde a migration
 * 20260421004523, mas nunca teve produtor nem tela: nenhum documento podia ser
 * registrado. O conteudo do documento nao sai do navegador -- apenas os hashes
 * SHA-256 dos chunks sao gravados, que e o modelo previsto na US-F3-01.
 */
export type FingerprintAction = "alert" | "redact" | "block";
export type FingerprintSeverity = "low" | "medium" | "high" | "critical";

export const CHUNK_SIZE = 256;
export const MIN_CHUNK_CHARS = 32;
export const MAX_CHUNKS_PER_DOCUMENT = 2000;
export const ROW_LIMIT = 5000;

export const ACTION_LABEL: Record<FingerprintAction, string> = {
  alert: "Alertar",
  redact: "Redigir",
  block: "Bloquear",
};

export const SEVERITY_LABEL: Record<FingerprintSeverity, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
  critical: "Critica",
};

export const ACTIONS: FingerprintAction[] = ["alert", "redact", "block"];
export const SEVERITIES: FingerprintSeverity[] = ["low", "medium", "high", "critical"];

export const TEXT_FILE_EXTENSIONS = ["txt", "csv", "md", "json", "log", "xml", "html", "sql"];

export interface FingerprintRow {
  id: string;
  company_id: string;
  document_name: string;
  document_type: string | null;
  chunk_hash: string;
  chunk_index: number;
  total_chunks: number;
  severity: FingerprintSeverity;
  action: FingerprintAction;
  is_active: boolean;
  created_at: string;
}

export interface FingerprintDocument {
  documentName: string;
  documentType: string | null;
  severity: FingerprintSeverity;
  action: FingerprintAction;
  isActive: boolean;
  storedChunks: number;
  totalChunks: number;
  createdAt: string;
}

export interface DocumentFormData {
  documentName: string;
  documentType: string;
  severity: FingerprintSeverity;
  action: FingerprintAction;
  text: string;
}

export const EMPTY_DOCUMENT_FORM: DocumentFormData = {
  documentName: "",
  documentType: "",
  severity: "high",
  action: "block",
  text: "",
};

const DOCUMENTS_KEY = ["dlp-fingerprints"] as const;

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function chunkText(text: string, chunkSize = CHUNK_SIZE): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const chunks: string[] = [];
  for (let index = 0; index < normalized.length; index += chunkSize) {
    const slice = normalized.slice(index, index + chunkSize);
    if (slice.trim().length >= MIN_CHUNK_CHARS) chunks.push(slice);
  }

  if (chunks.length === 0) chunks.push(normalized);
  return chunks.slice(0, MAX_CHUNKS_PER_DOCUMENT);
}

export async function sha256Hex(value: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("Web Crypto indisponivel neste navegador");
  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export interface FingerprintInsertRow {
  document_name: string;
  document_type: string | null;
  chunk_hash: string;
  chunk_index: number;
  total_chunks: number;
  severity: FingerprintSeverity;
  action: FingerprintAction;
  is_active: boolean;
  created_by: string | null;
}

export async function buildFingerprintRows(
  form: DocumentFormData,
  createdBy: string | null
): Promise<FingerprintInsertRow[]> {
  const chunks = chunkText(form.text);
  if (chunks.length === 0) throw new Error("O texto do documento esta vazio");

  const rows: FingerprintInsertRow[] = [];
  for (let index = 0; index < chunks.length; index += 1) {
    rows.push({
      document_name: form.documentName.trim(),
      document_type: form.documentType.trim() || null,
      chunk_hash: await sha256Hex(chunks[index]),
      chunk_index: index,
      total_chunks: chunks.length,
      severity: form.severity,
      action: form.action,
      is_active: true,
      created_by: createdBy,
    });
  }
  return rows;
}

export function groupDocuments(rows: FingerprintRow[]): FingerprintDocument[] {
  const byName = new Map<string, FingerprintDocument>();

  rows.forEach((row) => {
    const current = byName.get(row.document_name);
    if (!current) {
      byName.set(row.document_name, {
        documentName: row.document_name,
        documentType: row.document_type,
        severity: row.severity,
        action: row.action,
        isActive: row.is_active,
        storedChunks: 1,
        totalChunks: row.total_chunks,
        createdAt: row.created_at,
      });
      return;
    }
    current.storedChunks += 1;
    current.totalChunks = Math.max(current.totalChunks, row.total_chunks);
    current.isActive = current.isActive && row.is_active;
  });

  return Array.from(byName.values()).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  );
}

export function filterDocuments(documents: FingerprintDocument[], term: string) {
  const needle = term.trim().toLowerCase();
  if (!needle) return documents;
  return documents.filter((document) =>
    [document.documentName, document.documentType ?? "", document.severity, document.action]
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
}

export type DocumentFormErrors = Partial<Record<keyof DocumentFormData, string>>;

export function validateDocumentForm(
  form: DocumentFormData,
  existingNames: string[] = []
): DocumentFormErrors {
  const errors: DocumentFormErrors = {};
  const name = form.documentName.trim();

  if (name.length < 3) {
    errors.documentName = "Informe um nome de documento com pelo menos 3 caracteres.";
  } else if (existingNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    errors.documentName = "Ja existe um documento com esse nome. Remova o anterior antes.";
  }

  if (normalizeText(form.text).length < MIN_CHUNK_CHARS) {
    errors.text = `O texto precisa ter pelo menos ${MIN_CHUNK_CHARS} caracteres uteis.`;
  } else if (chunkText(form.text).length > MAX_CHUNKS_PER_DOCUMENT) {
    errors.text = `Documento acima de ${MAX_CHUNKS_PER_DOCUMENT} chunks. Divida em partes menores.`;
  }

  return errors;
}

export function isTextFile(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return TEXT_FILE_EXTENSIONS.includes(extension);
}

export function formatChunkLabel(stored: number, total: number): string {
  if (total > 0 && stored !== total) return `${stored} de ${total} chunks`;
  return `${stored} ${stored === 1 ? "chunk" : "chunks"}`;
}

export function useDlpFingerprintsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<DocumentFormData>(EMPTY_DOCUMENT_FORM);
  const [showErrors, setShowErrors] = useState(false);
  const [term, setTerm] = useState("");
  const [removing, setRemoving] = useState<FingerprintDocument | null>(null);
  const [tuning, setTuning] = useState<FingerprintDocument | null>(null);
  const [tuningForm, setTuningForm] = useState<{
    severity: FingerprintSeverity;
    action: FingerprintAction;
  }>({ severity: "high", action: "block" });

  const fingerprintsQuery = useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: async (): Promise<FingerprintRow[]> => {
      const { data, error } = await supabase
        .from("dlp_fingerprints")
        .select(
          "id, company_id, document_name, document_type, chunk_hash, chunk_index, total_chunks, severity, action, is_active, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(ROW_LIMIT);
      if (error) throw error;
      return (data ?? []) as FingerprintRow[];
    },
    ...queryPresets.list,
  });

  const rows = useMemo(() => fingerprintsQuery.data ?? [], [fingerprintsQuery.data]);
  const documents = useMemo(() => groupDocuments(rows), [rows]);
  const existingNames = useMemo(
    () => documents.map((document) => document.documentName),
    [documents]
  );
  const visibleDocuments = useMemo(() => filterDocuments(documents, term), [documents, term]);
  const errors = useMemo(
    () => validateDocumentForm(formData, existingNames),
    [formData, existingNames]
  );
  const activeDocuments = useMemo(
    () => documents.filter((document) => document.isActive).length,
    [documents]
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
  }, [queryClient]);

  const openCreate = useCallback(() => {
    setFormData(EMPTY_DOCUMENT_FORM);
    setShowErrors(false);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setShowErrors(false);
      setFormData(EMPTY_DOCUMENT_FORM);
    }
  }, []);

  const registerMutation = useMutation({
    mutationFn: async (form: DocumentFormData) => {
      const duplicate = existingNames.some(
        (name) => name.toLowerCase() === form.documentName.trim().toLowerCase()
      );
      if (duplicate) {
        throw new Error("Ja existe um documento com esse nome.");
      }

      const { data: userData } = await supabase.auth.getUser();
      const insertRows = await buildFingerprintRows(form, userData?.user?.id ?? null);
      const { error } = await supabase.from("dlp_fingerprints").insert(insertRows);
      if (error) throw error;
      return insertRows.length;
    },
    onSuccess: (chunkCount: number) => {
      invalidate();
      setDialogOpen(false);
      setFormData(EMPTY_DOCUMENT_FORM);
      setShowErrors(false);
      toast({
        title: "Documento registrado",
        description: `${chunkCount} chunk(s) hasheados e gravados. O conteudo do documento nao saiu do navegador.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ documentName, isActive }: { documentName: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("dlp_fingerprints")
        .update({ is_active: isActive })
        .eq("document_name", documentName);
      if (error) throw error;
    },
    onSuccess: (_result, variables) => {
      invalidate();
      toast({
        title: variables.isActive ? "Documento reativado" : "Documento desativado",
        description: variables.isActive
          ? "Os hashes voltam a valer no matcher."
          : "Os hashes continuam gravados, mas nao devem ser considerados.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao alterar documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const tuningMutation = useMutation({
    mutationFn: async ({
      documentName,
      severity,
      action,
    }: {
      documentName: string;
      severity: FingerprintSeverity;
      action: FingerprintAction;
    }) => {
      const { error } = await supabase
        .from("dlp_fingerprints")
        .update({ severity, action })
        .eq("document_name", documentName);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setTuning(null);
      toast({
        title: "Classificacao do documento atualizada",
        description: "Severidade e acao passam a valer para todos os chunks do documento.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (documentName: string) => {
      const { error } = await supabase
        .from("dlp_fingerprints")
        .delete()
        .eq("document_name", documentName);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setRemoving(null);
      toast({
        title: "Documento removido",
        description: "Todos os hashes desse documento foram apagados.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = useCallback(() => {
    const currentErrors = validateDocumentForm(formData, existingNames);
    if (Object.keys(currentErrors).length > 0) {
      setShowErrors(true);
      return;
    }
    registerMutation.mutate(formData);
  }, [formData, existingNames, registerMutation]);

  const openTuning = useCallback((document: FingerprintDocument) => {
    setTuning(document);
    setTuningForm({ severity: document.severity, action: document.action });
  }, []);

  const handleTuningSubmit = useCallback(() => {
    if (!tuning) return;
    tuningMutation.mutate({
      documentName: tuning.documentName,
      severity: tuningForm.severity,
      action: tuningForm.action,
    });
  }, [tuning, tuningForm, tuningMutation]);

  const handleRemove = useCallback(() => {
    if (removing) removeMutation.mutate(removing.documentName);
  }, [removing, removeMutation]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!isTextFile(file.name)) {
        toast({
          title: "Formato nao suportado nesta tela",
          description:
            "Envie um arquivo de texto (.txt, .csv, .md, .json, .log, .xml). Para PDF ou DOCX, exporte o texto antes: a extracao automatica ainda nao existe.",
          variant: "destructive",
        });
        return;
      }
      const text = await file.text();
      setFormData((current) => ({
        ...current,
        documentName: current.documentName || file.name,
        documentType: current.documentType || (file.name.split(".").pop() ?? "").toLowerCase(),
        text,
      }));
    },
    [toast]
  );

  return {
    documents,
    visibleDocuments,
    totalRows: rows.length,
    activeDocuments,
    term,
    setTerm,
    dialogOpen,
    formData,
    setFormData,
    errors,
    showErrors,
    removing,
    setRemoving,
    tuning,
    setTuning,
    tuningForm,
    setTuningForm,
    openCreate,
    openTuning,
    handleDialogOpenChange,
    handleSubmit,
    handleTuningSubmit,
    handleRemove,
    handleFile,
    toggleDocument: (document: FingerprintDocument) =>
      toggleMutation.mutate({
        documentName: document.documentName,
        isActive: !document.isActive,
      }),
    refetch: () => fingerprintsQuery.refetch(),
    isLoading: fingerprintsQuery.isLoading,
    isError: fingerprintsQuery.isError,
    error: fingerprintsQuery.error,
    isSaving: registerMutation.isPending,
    isRemoving: removeMutation.isPending,
    isTuning: tuningMutation.isPending,
  };
}
