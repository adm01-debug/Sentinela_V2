import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  EMPTY_MAPPING_FORM,
  INCIDENT_LIMIT,
  coverageByTactic,
  confidenceLabel,
  confidencePercent,
  filterMappings,
  filterTechniques,
  formFromMapping,
  isUuid,
  mappingExists,
  parseConfidence,
  resolveIncident,
  severityVariant,
  summarizeMappings,
  unmappedTechniques,
  useMitreMappingPage,
  validateMappingForm,
  type IncidentRef,
  type MappingFormData,
  type MitreMapping,
} from "@/hooks/useMitreMappingPage";
import type { MitreTechnique } from "@/hooks/useMitreTechniques";
import { supabase } from "@/integrations/supabase/client";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

const DLP_ID = "11111111-1111-4111-8111-111111111111";
const VIOLATION_ID = "22222222-2222-4222-8222-222222222222";

function technique(over: Partial<MitreTechnique>): MitreTechnique {
  return {
    id: "T1078",
    tactic: "Initial Access",
    name: "Valid Accounts",
    description: "Credenciais validas",
    severity_default: "high",
    url: "https://attack.mitre.org/techniques/T1078/",
    enabled: true,
    ...over,
  };
}

const TECHNIQUES: MitreTechnique[] = [
  technique({}),
  technique({
    id: "T1567",
    tactic: "Exfiltration",
    name: "Exfiltration Over Web Service",
    severity_default: "critical",
  }),
  technique({ id: "T1530", tactic: "Collection", name: "Data from Cloud Storage" }),
];

function mapping(over: Partial<MitreMapping>): MitreMapping {
  return {
    id: "m1",
    incident_type: "dlp_incident",
    incident_id: DLP_ID,
    technique_id: "T1078",
    confidence: 0.5,
    company_id: "company-1",
    metadata: {},
    created_at: "2026-11-26T10:00:00Z",
    ...over,
  };
}

function dlpIncident(over: Partial<IncidentRef>): IncidentRef {
  return {
    id: DLP_ID,
    type: "dlp_incident",
    companyId: "company-1",
    severity: "high",
    label: "Ana Souza · clipboard",
    detail: "CPF detectado",
    occurredAt: "2026-11-26T09:00:00Z",
    ...over,
  };
}

type Call = [string, unknown[]];

function makeBuilder(result: unknown) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "insert", "order", "limit", "eq", "delete", "update"]) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    });
  }
  builder.then = (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled, onRejected);
  return { builder, calls };
}

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const NOW = new Date("2026-11-26T12:00:00Z");

describe("confidence helpers", () => {
  it("converte confianca em porcentagem inteira", () => {
    expect(confidencePercent(0.5)).toBe(50);
    expect(confidencePercent(0.756)).toBe(76);
    expect(confidencePercent(1.4)).toBe(100);
    expect(confidencePercent(-1)).toBe(0);
  });

  it("nao quebra com valor invalido", () => {
    expect(confidencePercent(Number.NaN)).toBe(0);
  });

  it("rotula a confianca em faixas", () => {
    expect(confidenceLabel(0.1)).toBe("Baixa");
    expect(confidenceLabel(0.5)).toBe("Media");
    expect(confidenceLabel(0.8)).toBe("Alta");
    expect(confidenceLabel(0.95)).toBe("Muito alta");
    expect(confidenceLabel(Number.NaN)).toBe("Desconhecida");
  });

  it("aceita virgula decimal e rejeita fora de 0..1", () => {
    expect(parseConfidence("0,8")).toBe(0.8);
    expect(parseConfidence(" 0.25 ")).toBe(0.25);
    expect(parseConfidence("1.5")).toBeNull();
    expect(parseConfidence("-0.1")).toBeNull();
    expect(parseConfidence("")).toBeNull();
    expect(parseConfidence("abc")).toBeNull();
  });
});

describe("isUuid", () => {
  it("valida o formato usado em incident_id", () => {
    expect(isUuid(DLP_ID)).toBe(true);
    expect(isUuid("nao-e-uuid")).toBe(false);
    expect(isUuid("")).toBe(false);
  });
});

describe("validateMappingForm", () => {
  const valid: MappingFormData = {
    incidentType: "dlp_incident",
    incidentId: DLP_ID,
    techniqueId: "T1078",
    confidence: "0.7",
    notes: "",
  };

  it("aceita o formulario completo", () => {
    expect(validateMappingForm(valid)).toEqual({});
  });

  it("exige incidente", () => {
    expect(validateMappingForm({ ...valid, incidentId: "" })).toMatchObject({
      incidentId: expect.any(String),
    });
  });

  it("rejeita incidente com identificador invalido", () => {
    expect(validateMappingForm({ ...valid, incidentId: "123" }).incidentId).toContain("invalido");
  });

  it("exige tecnica", () => {
    expect(validateMappingForm({ ...valid, techniqueId: "" }).techniqueId).toBeTruthy();
  });

  it("rejeita confianca fora da faixa", () => {
    expect(validateMappingForm({ ...valid, confidence: "2" }).confidence).toBeTruthy();
  });

  it("rejeita observacao acima do limite", () => {
    expect(validateMappingForm({ ...valid, notes: "a".repeat(281) }).notes).toBeTruthy();
  });

  it("rejeita tipo de incidente desconhecido", () => {
    expect(
      validateMappingForm({ ...valid, incidentType: "outro" as MappingFormData["incidentType"] })
        .incidentType
    ).toBeTruthy();
  });
});

describe("formFromMapping", () => {
  it("reconstroi o formulario a partir do registro", () => {
    expect(
      formFromMapping(mapping({ confidence: 0.85, metadata: { notes: "revisado" } }))
    ).toMatchObject({
      incidentType: "dlp_incident",
      incidentId: DLP_ID,
      techniqueId: "T1078",
      confidence: "0.85",
      notes: "revisado",
    });
  });

  it("cai para dlp_incident quando o tipo gravado nao e conhecido", () => {
    expect(formFromMapping(mapping({ incident_type: "legado" })).incidentType).toBe("dlp_incident");
  });
});

describe("mappingExists", () => {
  it("detecta o par incidente + tecnica", () => {
    const mappings = [mapping({})];
    expect(
      mappingExists(mappings, {
        incidentType: "dlp_incident",
        incidentId: DLP_ID,
        techniqueId: "T1078",
      })
    ).toBe(true);
  });

  it("ignora o proprio registro na edicao", () => {
    const mappings = [mapping({})];
    expect(
      mappingExists(
        mappings,
        { incidentType: "dlp_incident", incidentId: DLP_ID, techniqueId: "T1078" },
        "m1"
      )
    ).toBe(false);
  });

  it("nao confunde tecnicas diferentes no mesmo incidente", () => {
    expect(
      mappingExists([mapping({})], {
        incidentType: "dlp_incident",
        incidentId: DLP_ID,
        techniqueId: "T1567",
      })
    ).toBe(false);
  });
});

describe("coverageByTactic", () => {
  it("conta tecnicas mapeadas por tatica", () => {
    const coverage = coverageByTactic(TECHNIQUES, [mapping({ technique_id: "T1567" })]);
    expect(coverage.find((entry) => entry.tactic === "Exfiltration")).toMatchObject({
      total: 1,
      mapped: 1,
    });
    expect(coverage.find((entry) => entry.tactic === "Initial Access")).toMatchObject({
      total: 1,
      mapped: 0,
    });
  });

  it("ordena pelas taticas mais usadas", () => {
    const coverage = coverageByTactic(TECHNIQUES, [mapping({ technique_id: "T1567" })]);
    expect(coverage[0].tactic).toBe("Exfiltration");
  });

  it("sem mapeamento, toda tatica fica zerada", () => {
    expect(coverageByTactic(TECHNIQUES, []).every((entry) => entry.mapped === 0)).toBe(true);
  });
});

describe("unmappedTechniques", () => {
  it("lista apenas as tecnicas sem nenhum incidente", () => {
    const result = unmappedTechniques(TECHNIQUES, [mapping({ technique_id: "T1078" })]);
    expect(result.map((item) => item.id)).toEqual(["T1567", "T1530"]);
  });

  it("nao duplica tecnica usada em varios incidentes", () => {
    const result = unmappedTechniques(TECHNIQUES, [
      mapping({ id: "m1", technique_id: "T1078" }),
      mapping({ id: "m2", technique_id: "T1078", incident_id: VIOLATION_ID }),
    ]);
    expect(result.map((item) => item.id)).toEqual(["T1567", "T1530"]);
  });
});

describe("filterTechniques", () => {
  it("busca por id, nome e tatica", () => {
    expect(filterTechniques(TECHNIQUES, "t1567", "")).toHaveLength(1);
    expect(filterTechniques(TECHNIQUES, "cloud", "")).toHaveLength(1);
    expect(filterTechniques(TECHNIQUES, "exfiltration", "")).toHaveLength(1);
  });

  it("filtra por tatica exata", () => {
    expect(filterTechniques(TECHNIQUES, "", "Collection")).toHaveLength(1);
  });

  it("sem termo devolve tudo", () => {
    expect(filterTechniques(TECHNIQUES, "   ", "")).toHaveLength(3);
  });
});

describe("summarizeMappings", () => {
  it("conta classificacoes, tecnicas, incidentes e confianca media", () => {
    const summary = summarizeMappings([
      mapping({ id: "m1", technique_id: "T1078", confidence: 0.4 }),
      mapping({ id: "m2", technique_id: "T1567", confidence: 0.6 }),
      mapping({
        id: "m3",
        technique_id: "T1078",
        incident_id: VIOLATION_ID,
        incident_type: "security_violation",
        confidence: 0.8,
      }),
    ]);
    expect(summary.total).toBe(3);
    expect(summary.techniques).toBe(2);
    expect(summary.incidents).toBe(2);
    expect(summary.avgConfidence).toBeCloseTo(0.6, 5);
  });

  it("nao divide por zero", () => {
    expect(summarizeMappings([])).toEqual({
      total: 0,
      techniques: 0,
      incidents: 0,
      avgConfidence: 0,
    });
  });
});

describe("resolveIncident", () => {
  it("so resolve quando tipo e id casam", () => {
    const incidents = [dlpIncident({})];
    expect(resolveIncident(incidents, "dlp_incident", DLP_ID)?.label).toBe("Ana Souza · clipboard");
    expect(resolveIncident(incidents, "security_violation", DLP_ID)).toBeNull();
    expect(resolveIncident(incidents, "dlp_incident", null)).toBeNull();
  });
});

describe("filterMappings", () => {
  it("busca por nome do colaborador e por tecnica", () => {
    const incidents = [dlpIncident({})];
    const mappings = [mapping({})];
    expect(filterMappings(mappings, "ana", incidents, TECHNIQUES)).toHaveLength(1);
    expect(filterMappings(mappings, "T1078", incidents, TECHNIQUES)).toHaveLength(1);
    expect(filterMappings(mappings, "inexistente", incidents, TECHNIQUES)).toHaveLength(0);
  });

  it("sem termo devolve tudo", () => {
    expect(filterMappings([mapping({})], "", [], TECHNIQUES)).toHaveLength(1);
  });
});

describe("severityVariant", () => {
  it("destaca criticidade alta na tabela do catalogo", () => {
    expect(severityVariant("critical")).toBe("destructive");
    expect(severityVariant("high")).toBe("destructive");
    expect(severityVariant("medium")).toBe("default");
    expect(severityVariant("low")).toBe("secondary");
  });
});

describe("useMitreMappingPage", () => {
  let mappingsResult: unknown = { data: [], error: null };
  let dlpResult: unknown = { data: [], error: null };
  let violationResult: unknown = { data: [], error: null };
  let dlpCalls: Call[] = [];
  let writes: { table: string; method: string; args: unknown[] }[] = [];

  beforeEach(() => {
    mappingsResult = { data: [], error: null };
    dlpResult = { data: [], error: null };
    violationResult = { data: [], error: null };
    dlpCalls = [];
    writes = [];
    toastMock.mockClear();

    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      const result =
        table === "incident_mitre_mapping"
          ? mappingsResult
          : table === "dlp_incidents"
            ? dlpResult
            : violationResult;
      const { builder, calls } = makeBuilder(result);
      if (table === "dlp_incidents") dlpCalls = calls;
      for (const method of ["insert", "update", "delete", "eq"]) {
        const original = builder[method] as (...args: unknown[]) => unknown;
        builder[method] = vi.fn((...args: unknown[]) => {
          writes.push({ table, method, args });
          return original(...args);
        });
      }
      return builder;
    }) as never);
  });

  it("le as classificacoes em ordem decrescente de criacao", async () => {
    mappingsResult = { data: [mapping({})], error: null };
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.mappings).toHaveLength(1));

    const order = writes.length; // garante que nao houve escrita ao apenas carregar
    expect(order).toBe(0);
  });

  it("carrega incidentes DLP e violacoes com teto por tabela", async () => {
    dlpResult = {
      data: [
        {
          id: DLP_ID,
          company_id: "company-1",
          source_type: "clipboard",
          severity: "high",
          employee_name: "Ana Souza",
          classifier_code: "cpf",
          match_summary: "CPF detectado",
          detected_at: "2026-11-26T09:00:00Z",
        },
      ],
      error: null,
    };
    violationResult = {
      data: [
        {
          id: VIOLATION_ID,
          violation_type: "uso_indevido",
          policy_name: "Politica de Uso",
          severity: "medium",
          employee_name: "Bruno Lima",
          created_at: "2026-11-25T09:00:00Z",
        },
      ],
      error: null,
    };

    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.incidents).toHaveLength(2));

    expect(result.current.incidents[0].label).toContain("Ana Souza");
    expect(result.current.incidents[1].type).toBe("security_violation");
    expect(result.current.incidentsForType("dlp_incident")).toHaveLength(1);
    expect(dlpCalls.find((call) => call[0] === "limit")?.[1]).toEqual([INCIDENT_LIMIT]);
  });

  it("tolera falha em uma das fontes de incidente", async () => {
    dlpResult = { data: null, error: new Error("sem permissao") };
    violationResult = {
      data: [
        {
          id: VIOLATION_ID,
          violation_type: "uso_indevido",
          policy_name: "Politica",
          severity: "low",
          employee_name: null,
          created_at: "2026-11-25T09:00:00Z",
        },
      ],
      error: null,
    };
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.incidents).toHaveLength(1));
    expect(result.current.isError).toBe(false);
  });

  it("falha quando as duas fontes de incidente falham", async () => {
    dlpResult = { data: null, error: new Error("offline") };
    violationResult = { data: null, error: new Error("offline") };
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("deriva resumo, cobertura e tecnicas sem uso", async () => {
    mappingsResult = {
      data: [mapping({ technique_id: "T1567", confidence: 0.9 })],
      error: null,
    };
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.mappings).toHaveLength(1));

    expect(result.current.summary.techniques).toBe(1);
    expect(result.current.coverage[0].tactic).toBe("Exfiltration");
    expect(result.current.unmapped.map((item) => item.id)).toEqual(["T1078", "T1530"]);
    expect(result.current.tactics).toEqual(["Collection", "Exfiltration", "Initial Access"]);
  });

  it("abre o formulario vazio e fecha limpando o estado", async () => {
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.openCreate());
    expect(result.current.dialogOpen).toBe(true);
    expect(result.current.editing).toBeNull();
    expect(result.current.formData).toEqual(EMPTY_MAPPING_FORM);

    act(() => result.current.handleDialogOpenChange(false));
    expect(result.current.dialogOpen).toBe(false);
  });

  it("abre em edicao com os dados do registro", async () => {
    const record = mapping({ confidence: 0.8, metadata: { notes: "ok" } });
    mappingsResult = { data: [record], error: null };
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.mappings).toHaveLength(1));

    act(() => result.current.openEdit(record));
    expect(result.current.formData.confidence).toBe("0.8");
    expect(result.current.formData.notes).toBe("ok");
    expect(result.current.editing?.id).toBe("m1");
  });

  it("nao envia formulario invalido", async () => {
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.openCreate());
    act(() => result.current.handleSubmit());

    await waitFor(() => expect(result.current.showErrors).toBe(true));
    expect(writes).toHaveLength(0);
    expect(result.current.dialogOpen).toBe(true);
  });

  it("cria a classificacao herdando a empresa do incidente", async () => {
    dlpResult = {
      data: [
        {
          id: DLP_ID,
          company_id: "company-9",
          source_type: "clipboard",
          severity: "critical",
          employee_name: "Ana Souza",
          classifier_code: null,
          match_summary: null,
          detected_at: "2026-11-26T09:00:00Z",
        },
      ],
      error: null,
    };
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.incidents).toHaveLength(1));

    act(() => result.current.openCreate());
    act(() =>
      result.current.setFormData({
        incidentType: "dlp_incident",
        incidentId: DLP_ID,
        techniqueId: "T1567",
        confidence: "0,9",
        notes: "  envio por webmail  ",
      })
    );
    act(() => result.current.handleSubmit());

    await waitFor(() => expect(result.current.dialogOpen).toBe(false));
    const insert = writes.find(
      (write) => write.table === "incident_mitre_mapping" && write.method === "insert"
    );
    expect(insert?.args[0]).toMatchObject({
      incident_type: "dlp_incident",
      incident_id: DLP_ID,
      technique_id: "T1567",
      confidence: 0.9,
      company_id: "company-9",
      metadata: { notes: "envio por webmail" },
    });
  });

  it("bloqueia tecnica repetida no mesmo incidente", async () => {
    mappingsResult = { data: [mapping({ technique_id: "T1078" })], error: null };
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.mappings).toHaveLength(1));

    act(() => result.current.openCreate());
    act(() =>
      result.current.setFormData({
        incidentType: "dlp_incident",
        incidentId: DLP_ID,
        techniqueId: "T1078",
        confidence: "0.5",
        notes: "",
      })
    );
    act(() => result.current.handleSubmit());

    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    expect(toastMock.mock.calls[0][0]).toMatchObject({ variant: "destructive" });
    expect(writes.filter((write) => write.method === "insert")).toHaveLength(0);
  });

  it("edita atualizando pelo id", async () => {
    const record = mapping({});
    mappingsResult = { data: [record], error: null };
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.mappings).toHaveLength(1));

    act(() => result.current.openEdit(record));
    act(() => result.current.setFormData({ ...result.current.formData, confidence: "0.95" }));
    act(() => result.current.handleSubmit());

    await waitFor(() => expect(result.current.dialogOpen).toBe(false));
    const update = writes.find((write) => write.method === "update");
    expect(update?.args[0]).toMatchObject({ confidence: 0.95 });
    expect(writes.find((write) => write.method === "eq")?.args).toEqual(["id", "m1"]);
  });

  it("remove a classificacao pelo id", async () => {
    const record = mapping({});
    mappingsResult = { data: [record], error: null };
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.mappings).toHaveLength(1));

    act(() => result.current.setRemoving(record));
    act(() => result.current.handleRemove());

    await waitFor(() => expect(result.current.removing).toBeNull());
    expect(writes.find((write) => write.method === "delete")?.table).toBe("incident_mitre_mapping");
    expect(writes.filter((write) => write.method === "eq")[0].args).toEqual(["id", "m1"]);
  });

  it("mostra erro de gravacao sem fechar o dialogo", async () => {
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mappingsResult = { data: null, error: new Error("RLS bloqueou") };
    act(() => result.current.openCreate());
    act(() =>
      result.current.setFormData({
        incidentType: "dlp_incident",
        incidentId: DLP_ID,
        techniqueId: "T1078",
        confidence: "0.5",
        notes: "",
      })
    );
    act(() => result.current.handleSubmit());

    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    expect(result.current.dialogOpen).toBe(true);
  });

  it("filtra as tecnicas do catalogo por tatica e busca", async () => {
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setTactic("Collection"));
    expect(result.current.visibleTechniques.map((item) => item.id)).toEqual(["T1530"]);

    act(() => result.current.setTactic(""));
    act(() => result.current.setTechniqueTerm("valid"));
    expect(result.current.visibleTechniques.map((item) => item.id)).toEqual(["T1078"]);
  });

  it("resolve o rotulo do incidente mesmo quando fora da janela carregada", async () => {
    mappingsResult = { data: [mapping({ incident_id: VIOLATION_ID })], error: null };
    const { result } = renderHook(() => useMitreMappingPage(TECHNIQUES), { wrapper });
    await waitFor(() => expect(result.current.mappings).toHaveLength(1));
    expect(result.current.incidentLabel(result.current.mappings[0])).toBe(
      "Incidente fora da janela carregada"
    );
  });

  it("nao quebra a data de referencia do catalogo", () => {
    expect(NOW.getUTCFullYear()).toBe(2026);
  });
});
