import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryPresets } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MitreTechnique } from "@/hooks/useMitreTechniques";

/**
 * Classificacao MITRE ATT&CK dos incidentes.
 *
 * `mitre_techniques` e um catalogo seedado e `incident_mitre_mapping` guarda
 * quais tecnicas apareceram em cada incidente -- com RLS admin para escrita.
 * Nenhuma das duas tinha tela nem produtor: o catalogo era invisivel e nenhum
 * incidente podia ser classificado. Esta tela fecha o ciclo (ler catalogo,
 * vincular tecnica a incidente, auditar cobertura por tatica).
 */
export type IncidentType = "dlp_incident" | "security_violation";

export const INCIDENT_TYPE_LABEL: Record<IncidentType, string> = {
  dlp_incident: "Incidente DLP",
  security_violation: "Violacao de politica",
};

export const INCIDENT_TYPES: IncidentType[] = ["dlp_incident", "security_violation"];

export const INCIDENT_LIMIT = 200;

export const NOTES_MAX_LENGTH = 280;

export interface MitreMapping {
  id: string;
  incident_type: string;
  incident_id: string | null;
  technique_id: string;
  confidence: number;
  company_id: string | null;
  metadata: { notes?: string } | null;
  created_at: string;
}

export interface IncidentRef {
  id: string;
  type: IncidentType;
  companyId: string | null;
  severity: string;
  label: string;
  detail: string;
  occurredAt: string;
}

export interface MappingFormData {
  incidentType: IncidentType;
  incidentId: string;
  techniqueId: string;
  confidence: string;
  notes: string;
}

export const EMPTY_MAPPING_FORM: MappingFormData = {
  incidentType: "dlp_incident",
  incidentId: "",
  techniqueId: "",
  confidence: "0.5",
  notes: "",
};

const MAPPINGS_KEY = ["mitre-mappings"] as const;
const INCIDENTS_KEY = ["mitre-incidents"] as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.trim());
}

export function confidencePercent(confidence: number): number {
  if (!Number.isFinite(confidence)) return 0;
  return Math.round(Math.min(1, Math.max(0, confidence)) * 100);
}

export function confidenceLabel(confidence: number): string {
  if (!Number.isFinite(confidence)) return "Desconhecida";
  if (confidence >= 0.9) return "Muito alta";
  if (confidence >= 0.7) return "Alta";
  if (confidence >= 0.4) return "Media";
  return "Baixa";
}

export function parseConfidence(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  if (value < 0 || value > 1) return null;
  return value;
}

export type MappingFormErrors = Partial<Record<keyof MappingFormData, string>>;

export function validateMappingForm(form: MappingFormData): MappingFormErrors {
  const errors: MappingFormErrors = {};

  if (!INCIDENT_TYPES.includes(form.incidentType)) {
    errors.incidentType = "Selecione o tipo do incidente.";
  }
  if (form.incidentId.trim() === "") {
    errors.incidentId = "Selecione o incidente.";
  } else if (!isUuid(form.incidentId)) {
    errors.incidentId = "Identificador de incidente invalido.";
  }
  if (form.techniqueId.trim() === "") {
    errors.techniqueId = "Selecione a tecnica MITRE.";
  }
  if (parseConfidence(form.confidence) === null) {
    errors.confidence = "Confianca deve ser um numero entre 0 e 1.";
  }
  if (form.notes.trim().length > NOTES_MAX_LENGTH) {
    errors.notes = `Observacao acima de ${NOTES_MAX_LENGTH} caracteres.`;
  }

  return errors;
}

export function formFromMapping(mapping: MitreMapping): MappingFormData {
  return {
    incidentType: (INCIDENT_TYPES.includes(mapping.incident_type as IncidentType)
      ? mapping.incident_type
      : "dlp_incident") as IncidentType,
    incidentId: mapping.incident_id ?? "",
    techniqueId: mapping.technique_id,
    confidence: String(mapping.confidence),
    notes: mapping.metadata?.notes ?? "",
  };
}

export function mappingExists(
  mappings: MitreMapping[],
  candidate: { incidentType: string; incidentId: string; techniqueId: string },
  ignoreId?: string
): boolean {
  return mappings.some(
    (mapping) =>
      mapping.id !== ignoreId &&
      mapping.incident_type === candidate.incidentType &&
      (mapping.incident_id ?? "") === candidate.incidentId &&
      mapping.technique_id === candidate.techniqueId
  );
}

export interface TacticCoverage {
  tactic: string;
  total: number;
  mapped: number;
}

export function coverageByTactic(
  techniques: MitreTechnique[],
  mappings: MitreMapping[]
): TacticCoverage[] {
  const mappedTechniques = new Set(mappings.map((mapping) => mapping.technique_id));
  const byTactic = new Map<string, TacticCoverage>();

  techniques.forEach((technique) => {
    const current = byTactic.get(technique.tactic) ?? {
      tactic: technique.tactic,
      total: 0,
      mapped: 0,
    };
    current.total += 1;
    if (mappedTechniques.has(technique.id)) current.mapped += 1;
    byTactic.set(technique.tactic, current);
  });

  return Array.from(byTactic.values()).sort((a, b) => {
    if (b.mapped !== a.mapped) return b.mapped - a.mapped;
    return a.tactic.localeCompare(b.tactic);
  });
}

export function unmappedTechniques(
  techniques: MitreTechnique[],
  mappings: MitreMapping[]
): MitreTechnique[] {
  const mappedTechniques = new Set(mappings.map((mapping) => mapping.technique_id));
  return techniques.filter((technique) => !mappedTechniques.has(technique.id));
}

export function filterTechniques(
  techniques: MitreTechnique[],
  term: string,
  tactic: string
): MitreTechnique[] {
  const needle = term.trim().toLowerCase();
  return techniques.filter((technique) => {
    if (tactic && technique.tactic !== tactic) return false;
    if (!needle) return true;
    return (
      technique.id.toLowerCase().includes(needle) ||
      technique.name.toLowerCase().includes(needle) ||
      technique.tactic.toLowerCase().includes(needle)
    );
  });
}

export interface MappingSummary {
  total: number;
  techniques: number;
  incidents: number;
  avgConfidence: number;
}

export function summarizeMappings(mappings: MitreMapping[]): MappingSummary {
  const techniques = new Set(mappings.map((mapping) => mapping.technique_id));
  const incidents = new Set(
    mappings.map((mapping) => `${mapping.incident_type}:${mapping.incident_id ?? ""}`)
  );
  const totalConfidence = mappings.reduce(
    (sum, mapping) => sum + (Number.isFinite(mapping.confidence) ? mapping.confidence : 0),
    0
  );

  return {
    total: mappings.length,
    techniques: techniques.size,
    incidents: incidents.size,
    avgConfidence: mappings.length === 0 ? 0 : totalConfidence / mappings.length,
  };
}

export function resolveIncident(
  incidents: IncidentRef[],
  incidentType: string,
  incidentId: string | null
): IncidentRef | null {
  if (!incidentId) return null;
  return (
    incidents.find((incident) => incident.id === incidentId && incident.type === incidentType) ??
    null
  );
}

export function filterMappings(
  mappings: MitreMapping[],
  term: string,
  incidents: IncidentRef[],
  techniques: MitreTechnique[]
): MitreMapping[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return mappings;

  return mappings.filter((mapping) => {
    const incident = resolveIncident(incidents, mapping.incident_type, mapping.incident_id);
    const technique = techniques.find((item) => item.id === mapping.technique_id);
    const haystack = [
      mapping.incident_type,
      INCIDENT_TYPE_LABEL[mapping.incident_type as IncidentType] ?? "",
      incident?.label ?? "",
      incident?.detail ?? "",
      mapping.technique_id,
      technique?.name ?? "",
      technique?.tactic ?? "",
      mapping.metadata?.notes ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function severityVariant(severity: string): "default" | "secondary" | "destructive" {
  if (severity === "critical" || severity === "high") return "destructive";
  if (severity === "medium") return "default";
  return "secondary";
}

export function useMitreMappingPage(techniques: MitreTechnique[]) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MitreMapping | null>(null);
  const [formData, setFormData] = useState<MappingFormData>(EMPTY_MAPPING_FORM);
  const [showErrors, setShowErrors] = useState(false);
  const [removing, setRemoving] = useState<MitreMapping | null>(null);
  const [term, setTerm] = useState("");
  const [techniqueTerm, setTechniqueTerm] = useState("");
  const [tactic, setTactic] = useState("");

  const mappingsQuery = useQuery({
    queryKey: MAPPINGS_KEY,
    queryFn: async (): Promise<MitreMapping[]> => {
      const { data, error } = await supabase
        .from("incident_mitre_mapping")
        .select(
          "id, incident_type, incident_id, technique_id, confidence, company_id, metadata, created_at"
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MitreMapping[];
    },
    ...queryPresets.list,
  });

  const incidentsQuery = useQuery({
    queryKey: INCIDENTS_KEY,
    queryFn: async (): Promise<IncidentRef[]> => {
      const [dlpResult, violationResult] = await Promise.all([
        supabase
          .from("dlp_incidents")
          .select(
            "id, company_id, source_type, severity, employee_name, classifier_code, match_summary, detected_at"
          )
          .order("detected_at", { ascending: false })
          .limit(INCIDENT_LIMIT),
        supabase
          .from("security_violations")
          .select("id, violation_type, policy_name, severity, employee_name, created_at")
          .order("created_at", { ascending: false })
          .limit(INCIDENT_LIMIT),
      ]);

      if (dlpResult.error && violationResult.error) throw dlpResult.error;

      const incidents: IncidentRef[] = [];

      (dlpResult.data ?? []).forEach((row) => {
        const record = row as {
          id: string;
          company_id: string | null;
          source_type: string | null;
          severity: string | null;
          employee_name: string | null;
          classifier_code: string | null;
          match_summary: string | null;
          detected_at: string | null;
        };
        incidents.push({
          id: record.id,
          type: "dlp_incident",
          companyId: record.company_id,
          severity: record.severity ?? "medium",
          label: `${record.employee_name ?? "Colaborador nao identificado"} · ${
            record.source_type ?? "origem desconhecida"
          }`,
          detail: record.match_summary ?? record.classifier_code ?? "Sem resumo de deteccao",
          occurredAt: record.detected_at ?? new Date(0).toISOString(),
        });
      });

      (violationResult.data ?? []).forEach((row) => {
        const record = row as {
          id: string;
          violation_type: string | null;
          policy_name: string | null;
          severity: string | null;
          employee_name: string | null;
          created_at: string | null;
        };
        incidents.push({
          id: record.id,
          type: "security_violation",
          companyId: null,
          severity: record.severity ?? "medium",
          label: `${record.employee_name ?? "Colaborador nao identificado"} · ${
            record.violation_type ?? "violacao"
          }`,
          detail: record.policy_name ?? "Politica nao informada",
          occurredAt: record.created_at ?? new Date(0).toISOString(),
        });
      });

      incidents.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
      return incidents;
    },
    ...queryPresets.list,
  });

  const mappings = useMemo(() => mappingsQuery.data ?? [], [mappingsQuery.data]);
  const incidents = useMemo(() => incidentsQuery.data ?? [], [incidentsQuery.data]);

  const visibleMappings = useMemo(
    () => filterMappings(mappings, term, incidents, techniques),
    [mappings, term, incidents, techniques]
  );
  const summary = useMemo(() => summarizeMappings(mappings), [mappings]);
  const coverage = useMemo(() => coverageByTactic(techniques, mappings), [techniques, mappings]);
  const unmapped = useMemo(() => unmappedTechniques(techniques, mappings), [techniques, mappings]);
  const visibleTechniques = useMemo(
    () => filterTechniques(techniques, techniqueTerm, tactic),
    [techniques, techniqueTerm, tactic]
  );
  const tactics = useMemo(
    () => Array.from(new Set(techniques.map((technique) => technique.tactic))).sort(),
    [techniques]
  );
  const errors = useMemo(() => validateMappingForm(formData), [formData]);

  const incidentsForType = useCallback(
    (type: IncidentType) => incidents.filter((incident) => incident.type === type),
    [incidents]
  );

  const incidentLabel = useCallback(
    (mapping: MitreMapping) => {
      const incident = resolveIncident(incidents, mapping.incident_type, mapping.incident_id);
      return incident?.label ?? "Incidente fora da janela carregada";
    },
    [incidents]
  );

  const techniqueById = useCallback(
    (techniqueId: string) => techniques.find((technique) => technique.id === techniqueId) ?? null,
    [techniques]
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormData(EMPTY_MAPPING_FORM);
    setShowErrors(false);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((mapping: MitreMapping) => {
    setEditing(mapping);
    setFormData(formFromMapping(mapping));
    setShowErrors(false);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditing(null);
      setShowErrors(false);
    }
  }, []);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: MAPPINGS_KEY });
  }, [queryClient]);

  const buildPayload = useCallback(
    (form: MappingFormData) => {
      const incident = resolveIncident(
        incidents,
        form.incidentType,
        form.incidentId.trim() || null
      );
      const notes = form.notes.trim();
      return {
        incident_type: form.incidentType,
        incident_id: form.incidentId.trim() || null,
        technique_id: form.techniqueId,
        confidence: parseConfidence(form.confidence) ?? 0.5,
        company_id: incident?.companyId ?? null,
        metadata: notes ? { notes } : {},
      };
    },
    [incidents]
  );

  const saveMutation = useMutation({
    mutationFn: async ({ form, id }: { form: MappingFormData; id?: string }) => {
      const candidate = {
        incidentType: form.incidentType,
        incidentId: form.incidentId.trim(),
        techniqueId: form.techniqueId,
      };
      if (mappingExists(mappings, candidate, id)) {
        throw new Error("Essa tecnica ja esta vinculada a este incidente.");
      }

      const payload = buildPayload(form);
      if (id) {
        const { error } = await supabase
          .from("incident_mitre_mapping")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("incident_mitre_mapping").insert(payload);
      if (error) throw error;
    },
    onSuccess: (_result, variables) => {
      invalidate();
      setDialogOpen(false);
      setEditing(null);
      setFormData(EMPTY_MAPPING_FORM);
      toast({
        title: variables.id ? "Classificacao atualizada" : "Classificacao criada",
        description: "O incidente passa a contar na cobertura de tecnicas MITRE.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar classificacao",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("incident_mitre_mapping").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setRemoving(null);
      toast({
        title: "Classificacao removida",
        description: "A tecnica deixa de contar para esse incidente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover classificacao",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = useCallback(() => {
    const currentErrors = validateMappingForm(formData);
    if (Object.keys(currentErrors).length > 0) {
      setShowErrors(true);
      return;
    }
    saveMutation.mutate({ form: formData, id: editing?.id });
  }, [formData, editing, saveMutation]);

  const handleRemove = useCallback(() => {
    if (removing) removeMutation.mutate(removing.id);
  }, [removing, removeMutation]);

  const refetchAll = useCallback(() => {
    mappingsQuery.refetch();
    incidentsQuery.refetch();
  }, [mappingsQuery, incidentsQuery]);

  return {
    mappings,
    visibleMappings,
    incidents,
    incidentsForType,
    summary,
    coverage,
    unmapped,
    techniques,
    visibleTechniques,
    tactics,
    term,
    setTerm,
    techniqueTerm,
    setTechniqueTerm,
    tactic,
    setTactic,
    dialogOpen,
    editing,
    formData,
    setFormData,
    errors,
    showErrors,
    removing,
    setRemoving,
    techniqueById,
    incidentLabel,
    incidentTypeLabel: INCIDENT_TYPE_LABEL,
    severityVariant,
    openCreate,
    openEdit,
    handleDialogOpenChange,
    handleSubmit,
    handleRemove,
    refetchAll,
    isSaving: saveMutation.isPending,
    isRemoving: removeMutation.isPending,
    isLoading: mappingsQuery.isLoading || incidentsQuery.isLoading,
    isError: mappingsQuery.isError || incidentsQuery.isError,
    error: mappingsQuery.error ?? incidentsQuery.error,
  };
}
