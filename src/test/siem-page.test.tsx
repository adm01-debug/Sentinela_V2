import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  DELIVERY_LIMIT,
  EMPTY_CONNECTOR_FORM,
  PAUSE_MINUTES,
  connectorHealth,
  filterConnectors,
  formFromConnector,
  formatAge,
  oldestPending,
  severityLabel,
  summarizeDeliveries,
  summarizeOutbox,
  useSIEMPage,
  validateConnectorForm,
  type SiemConnector,
  type SiemDeliveryEntry,
  type SiemOutboxEntry,
} from "@/hooks/useSIEMPage";
import { supabase } from "@/integrations/supabase/client";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

function connector(over: Partial<SiemConnector>): SiemConnector {
  return {
    id: "c1",
    name: "Splunk corporativo",
    description: null,
    connector_type: "splunk_hec",
    endpoint: "https://splunk.exemplo.com/services/collector/event",
    event_filters: ["security_violation", "dlp_incident"],
    min_severity: "low",
    is_active: true,
    paused_until: null,
    consecutive_failures: 0,
    last_success_at: null,
    last_error: null,
    last_error_at: null,
    timeout_ms: 5000,
    created_at: "2026-11-01T10:00:00Z",
    ...over,
  };
}

function outboxEntry(over: Partial<SiemOutboxEntry>): SiemOutboxEntry {
  return {
    id: "o1",
    connector_id: "c1",
    event_type: "security_violation",
    source_table: "security_violations",
    source_id: "v1",
    status: "pending",
    attempts: 0,
    last_error: null,
    next_retry_at: "2026-11-26T12:00:00Z",
    enqueued_at: "2026-11-26T12:00:00Z",
    sent_at: null,
    ...over,
  };
}

function delivery(over: Partial<SiemDeliveryEntry>): SiemDeliveryEntry {
  return {
    id: "d1",
    connector_id: "c1",
    event_type: "security_violation",
    status: "success",
    http_code: 200,
    latency_ms: 120,
    error: null,
    response_excerpt: null,
    delivered_at: "2026-11-26T12:00:00Z",
    ...over,
  };
}

const NOW = new Date("2026-11-26T12:00:00Z");

describe("connectorHealth", () => {
  it("conector desativado nunca aparece saudavel", () => {
    expect(connectorHealth(connector({ is_active: false, consecutive_failures: 9 }), NOW)).toBe(
      "inactive"
    );
  });

  it("pausa intencional vence a contagem de falhas", () => {
    expect(
      connectorHealth(
        connector({
          paused_until: "2026-11-26T12:10:00Z",
          consecutive_failures: 3,
        }),
        NOW
      )
    ).toBe("paused");
  });

  it("pausa vencida nao segura o conector", () => {
    expect(connectorHealth(connector({ paused_until: "2026-11-26T11:00:00Z" }), NOW)).toBe(
      "active"
    );
  });

  it("falha acumulada marca o conector como problemático", () => {
    expect(connectorHealth(connector({ consecutive_failures: 1 }), NOW)).toBe("failing");
  });

  it("data de pausa invalida nao trava o conector para sempre", () => {
    expect(connectorHealth(connector({ paused_until: "nao-e-data" }), NOW)).toBe("active");
  });
});

describe("summarizeOutbox", () => {
  it("conta cada situacao da fila", () => {
    const summary = summarizeOutbox([
      outboxEntry({ id: "1", status: "pending" }),
      outboxEntry({ id: "2", status: "pending" }),
      outboxEntry({ id: "3", status: "sent" }),
      outboxEntry({ id: "4", status: "failed" }),
      outboxEntry({ id: "5", status: "dead_letter" }),
    ]);
    expect(summary).toEqual({ total: 5, pending: 2, sent: 1, failed: 1, deadLetter: 1 });
  });

  it("nao inventa numero com fila vazia", () => {
    expect(summarizeOutbox([])).toEqual({
      total: 0,
      pending: 0,
      sent: 0,
      failed: 0,
      deadLetter: 0,
    });
  });
});

describe("oldestPending", () => {
  it("devolve o evento mais antigo ainda na fila, ignorando os ja enviados", () => {
    const oldest = oldestPending([
      outboxEntry({ id: "novo", enqueued_at: "2026-11-26T11:50:00Z" }),
      outboxEntry({ id: "antigo", enqueued_at: "2026-11-26T09:00:00Z" }),
      outboxEntry({ id: "enviado", status: "sent", enqueued_at: "2026-11-25T09:00:00Z" }),
    ]);
    expect(oldest?.id).toBe("antigo");
  });

  it("sem pendencia devolve null", () => {
    expect(oldestPending([outboxEntry({ status: "sent" })])).toBeNull();
    expect(oldestPending([])).toBeNull();
  });
});

describe("formatAge", () => {
  it("descreve o atraso em minutos, horas e dias", () => {
    expect(formatAge("2026-11-26T11:59:30Z", NOW)).toBe("agora");
    expect(formatAge("2026-11-26T11:30:00Z", NOW)).toBe("há 30 min");
    expect(formatAge("2026-11-26T04:00:00Z", NOW)).toBe("há 8 h");
    expect(formatAge("2026-11-25T12:00:00Z", NOW)).toBe("há 1 dia");
    expect(formatAge("2026-11-20T12:00:00Z", NOW)).toBe("há 6 dias");
  });

  it("data invalida nao quebra a tela", () => {
    expect(formatAge("nao-e-data", NOW)).toBe("—");
  });
});

describe("summarizeDeliveries", () => {
  it("calcula taxa de sucesso, latencia media e falhas das ultimas 24h", () => {
    const summary = summarizeDeliveries(
      [
        delivery({ id: "1", status: "success", latency_ms: 100 }),
        delivery({ id: "2", status: "success", latency_ms: 300 }),
        delivery({
          id: "3",
          status: "failure",
          latency_ms: null,
          delivered_at: "2026-11-26T11:00:00Z",
        }),
        delivery({
          id: "4",
          status: "failure",
          latency_ms: null,
          delivered_at: "2026-11-20T11:00:00Z",
        }),
      ],
      NOW
    );
    expect(summary.total).toBe(4);
    expect(summary.success).toBe(2);
    expect(summary.failure).toBe(2);
    expect(summary.successRate).toBe(50);
    expect(summary.averageLatencyMs).toBe(200);
    expect(summary.failuresLast24h).toBe(1);
  });

  it("sem entrega nao divide por zero", () => {
    expect(summarizeDeliveries([], NOW)).toEqual({
      total: 0,
      success: 0,
      failure: 0,
      successRate: 0,
      averageLatencyMs: null,
      failuresLast24h: 0,
    });
  });
});

describe("filterConnectors", () => {
  const list = [
    connector({ id: "1", name: "Splunk corporativo" }),
    connector({
      id: "2",
      name: "Sentinel TI",
      connector_type: "microsoft_sentinel",
      is_active: false,
    }),
    connector({
      id: "3",
      name: "Syslog rede",
      connector_type: "syslog_cef",
      endpoint: "udp://siem.local:514",
    }),
  ];

  it("busca por nome, tipo e endereco", () => {
    expect(filterConnectors(list, "sentinel").map((item) => item.id)).toEqual(["2"]);
    expect(filterConnectors(list, "Microsoft Sentinel").map((item) => item.id)).toEqual(["2"]);
    expect(filterConnectors(list, "siem.local").map((item) => item.id)).toEqual(["3"]);
  });

  it("respeita o filtro de somente ativos", () => {
    expect(filterConnectors(list, "", true).map((item) => item.id)).toEqual(["1", "3"]);
  });

  it("sem filtro devolve tudo", () => {
    expect(filterConnectors(list, "   ")).toHaveLength(3);
  });
});

describe("validateConnectorForm", () => {
  it("exige nome, endereco valido, evento e tempo limite", () => {
    expect(validateConnectorForm(EMPTY_CONNECTOR_FORM)).toEqual([
      "Informe um nome para o conector.",
      "Informe o endereço completo (http://, https://, udp:// ou tcp://).",
    ]);
  });

  it("aceita syslog via udp e webhook https", () => {
    expect(
      validateConnectorForm({
        ...EMPTY_CONNECTOR_FORM,
        name: "Syslog rede",
        endpoint: "udp://siem.local:514",
      })
    ).toEqual([]);
    expect(
      validateConnectorForm({
        ...EMPTY_CONNECTOR_FORM,
        name: "Webhook",
        endpoint: "https://webhook.exemplo.com/sentinela",
      })
    ).toEqual([]);
  });

  it("recusa endereco sem protocolo e conector sem evento", () => {
    expect(
      validateConnectorForm({
        ...EMPTY_CONNECTOR_FORM,
        name: "X",
        endpoint: "siem.local:514",
        eventFilters: [],
      })
    ).toEqual([
      "Informe o endereço completo (http://, https://, udp:// ou tcp://).",
      "Escolha pelo menos um tipo de evento.",
    ]);
  });

  it("limita o tempo limite entre 1 e 60 segundos", () => {
    const base = { ...EMPTY_CONNECTOR_FORM, name: "X", endpoint: "https://x.com" };
    expect(validateConnectorForm({ ...base, timeoutMs: "500" })).toHaveLength(1);
    expect(validateConnectorForm({ ...base, timeoutMs: "70000" })).toHaveLength(1);
    expect(validateConnectorForm({ ...base, timeoutMs: "abc" })).toHaveLength(1);
    expect(validateConnectorForm({ ...base, timeoutMs: "5000" })).toHaveLength(0);
  });
});

describe("formFromConnector e severityLabel", () => {
  it("abre o formulario com os dados atuais do conector", () => {
    const form = formFromConnector(
      connector({ description: "produção", event_filters: ["auth_event"], timeout_ms: 8000 })
    );
    expect(form).toMatchObject({
      name: "Splunk corporativo",
      description: "produção",
      connectorType: "splunk_hec",
      eventFilters: ["auth_event"],
      timeoutMs: "8000",
      isActive: true,
    });
  });

  it("traduz a severidade minima", () => {
    expect(severityLabel("critical")).toBe("Crítica");
    expect(severityLabel("desconhecida")).toBe("desconhecida");
  });
});

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

describe("useSIEMPage", () => {
  let connectorsResult: unknown = { data: [], error: null };
  let outboxResult: unknown = { data: [], error: null };
  let deliveriesResult: unknown = { data: [], error: null };
  let outboxCalls: Call[] = [];
  let writes: { table: string; method: string; args: unknown[] }[] = [];

  beforeEach(() => {
    connectorsResult = { data: [], error: null };
    outboxResult = { data: [], error: null };
    deliveriesResult = { data: [], error: null };
    outboxCalls = [];
    writes = [];
    toastMock.mockClear();
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    } as never);

    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      const result =
        table === "siem_connectors"
          ? connectorsResult
          : table === "siem_event_outbox"
            ? outboxResult
            : deliveriesResult;
      const { builder, calls } = makeBuilder(result);
      if (table === "siem_event_outbox") outboxCalls = calls;
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

  it("le fila e historico com teto de registros e ordem decrescente", async () => {
    outboxResult = { data: [outboxEntry({ id: "1" })], error: null };
    deliveriesResult = { data: [delivery({ id: "1" })], error: null };
    const { result } = renderHook(() => useSIEMPage(), { wrapper });
    await waitFor(() => expect(result.current.outbox).toHaveLength(1));
    await waitFor(() => expect(result.current.deliveries).toHaveLength(1));

    expect(outboxCalls.find((call) => call[0] === "order")?.[1]).toEqual([
      "enqueued_at",
      { ascending: false },
    ]);
    expect(outboxCalls.find((call) => call[0] === "limit")?.[1]).toEqual([200]);
    expect(DELIVERY_LIMIT).toBe(100);
  });

  it("resume conectores, fila e entregas para os cartoes da tela", async () => {
    connectorsResult = {
      data: [connector({ id: "1" }), connector({ id: "2", is_active: false })],
      error: null,
    };
    outboxResult = {
      data: [
        outboxEntry({ id: "1", status: "pending" }),
        outboxEntry({ id: "2", status: "failed" }),
      ],
      error: null,
    };
    deliveriesResult = {
      data: [delivery({ id: "1", status: "success" }), delivery({ id: "2", status: "failure" })],
      error: null,
    };
    const { result } = renderHook(() => useSIEMPage(), { wrapper });
    await waitFor(() => expect(result.current.allConnectors).toHaveLength(2));

    expect(result.current.outboxSummary).toMatchObject({ pending: 1, failed: 1 });
    expect(result.current.deliverySummary.successRate).toBe(50);
    expect(result.current.oldestPending?.id).toBe("1");
  });

  it("mostra o nome do conector de cada evento da fila", async () => {
    connectorsResult = { data: [connector({ id: "c1", name: "Splunk corporativo" })], error: null };
    outboxResult = { data: [outboxEntry({ connector_id: "c1" })], error: null };
    const { result } = renderHook(() => useSIEMPage(), { wrapper });
    await waitFor(() => expect(result.current.connectors).toHaveLength(1));

    expect(result.current.connectorName("c1")).toBe("Splunk corporativo");
    expect(result.current.connectorName("sumiu")).toBe("Conector removido");
  });

  it("cria o conector com os campos normalizados e o autor logado", async () => {
    const { result } = renderHook(() => useSIEMPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.handleOpenCreate());
    act(() =>
      result.current.setFormData({
        ...EMPTY_CONNECTOR_FORM,
        name: "  Splunk corporativo  ",
        description: "  produção  ",
        endpoint: "  https://splunk.exemplo.com/event  ",
        minSeverity: "high",
      })
    );
    await act(async () => {
      result.current.handleSubmit();
    });

    const insert = writes.find((write) => write.method === "insert");
    expect(insert?.table).toBe("siem_connectors");
    expect(insert?.args[0]).toMatchObject({
      name: "Splunk corporativo",
      description: "produção",
      endpoint: "https://splunk.exemplo.com/event",
      min_severity: "high",
      timeout_ms: 5000,
      is_active: true,
      created_by: "admin-1",
    });
    await waitFor(() => expect(result.current.dialogOpen).toBe(false));
  });

  it("nao grava conector sem nome ou com endereco invalido", () => {
    const { result } = renderHook(() => useSIEMPage(), { wrapper });

    act(() => result.current.handleOpenCreate());
    act(() => {
      result.current.setFormData({ ...EMPTY_CONNECTOR_FORM, name: "", endpoint: "siem.local" });
    });
    act(() => result.current.handleSubmit());

    expect(writes).toHaveLength(0);
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Revise o conector", variant: "destructive" })
    );
  });

  it("edita o conector existente pelo id", async () => {
    connectorsResult = { data: [connector({ id: "c9", name: "Sentinel TI" })], error: null };
    const { result } = renderHook(() => useSIEMPage(), { wrapper });
    await waitFor(() => expect(result.current.connectors).toHaveLength(1));

    act(() => result.current.handleOpenEdit(result.current.connectors[0]));
    act(() => result.current.setFormData({ ...result.current.formData, name: "Sentinel TI 2" }));
    await act(async () => {
      result.current.handleSubmit();
    });

    const update = writes.find((write) => write.method === "update");
    expect(update?.table).toBe("siem_connectors");
    expect(update?.args[0]).toMatchObject({ name: "Sentinel TI 2" });
    expect(writes.find((write) => write.method === "eq")?.args).toEqual(["id", "c9"]);
  });

  it("pausa e retoma o envio do conector", async () => {
    connectorsResult = { data: [connector({ id: "c1" })], error: null };
    const { result } = renderHook(() => useSIEMPage(), { wrapper });
    await waitFor(() => expect(result.current.connectors).toHaveLength(1));

    await act(async () => {
      result.current.handlePause(result.current.allConnectors[0]);
    });
    const pause = writes.find((write) => write.method === "update");
    const pausedUntil = new Date(
      (pause?.args[0] as { paused_until: string }).paused_until
    ).getTime();
    const expected = Date.now() + PAUSE_MINUTES * 60 * 1000;
    expect(Math.abs(pausedUntil - expected)).toBeLessThan(5000);

    writes = [];
    await act(async () => {
      result.current.handleResume(result.current.allConnectors[0]);
    });
    expect(writes.find((write) => write.method === "update")?.args[0]).toMatchObject({
      paused_until: null,
      consecutive_failures: 0,
    });
  });

  it("ativa e desativa o conector", async () => {
    connectorsResult = { data: [connector({ id: "c1", is_active: true })], error: null };
    const { result } = renderHook(() => useSIEMPage(), { wrapper });
    await waitFor(() => expect(result.current.connectors).toHaveLength(1));

    await act(async () => {
      result.current.handleToggleActive(result.current.allConnectors[0]);
    });

    expect(writes.find((write) => write.method === "update")?.args[0]).toEqual({
      is_active: false,
    });
  });

  it("pede confirmacao antes de remover e so entao apaga", async () => {
    connectorsResult = { data: [connector({ id: "c1" })], error: null };
    const { result } = renderHook(() => useSIEMPage(), { wrapper });
    await waitFor(() => expect(result.current.connectors).toHaveLength(1));

    act(() => result.current.setRemoving(result.current.allConnectors[0]));
    expect(writes.filter((write) => write.method === "delete")).toHaveLength(0);

    await act(async () => {
      result.current.handleRemove();
    });
    expect(writes.find((write) => write.method === "delete")?.table).toBe("siem_connectors");
    expect(writes.find((write) => write.method === "eq")?.args).toEqual(["id", "c1"]);
    await waitFor(() => expect(result.current.removing).toBeNull());
  });

  it("filtra conectores em memoria sem repetir a consulta", async () => {
    connectorsResult = {
      data: [connector({ id: "1" }), connector({ id: "2", is_active: false, name: "Sentinel TI" })],
      error: null,
    };
    const { result } = renderHook(() => useSIEMPage(), { wrapper });
    await waitFor(() => expect(result.current.allConnectors).toHaveLength(2));

    act(() => result.current.setTerm("sentinel"));
    await waitFor(() => expect(result.current.connectors.map((item) => item.id)).toEqual(["2"]));

    act(() => result.current.setOnlyActive(true));
    await waitFor(() => expect(result.current.connectors).toHaveLength(0));
    expect(result.current.hasFilters).toBe(true);

    act(() => result.current.clearFilters());
    expect(result.current.connectors).toHaveLength(2);
    expect(result.current.hasFilters).toBe(false);
  });

  it("sinaliza erro quando a leitura falha", async () => {
    connectorsResult = { data: null, error: { message: "permission denied" } };
    const { result } = renderHook(() => useSIEMPage(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.allConnectors).toEqual([]);
  });

  it("alterna o evento do formulario sem perder os demais", () => {
    const { result } = renderHook(() => useSIEMPage(), { wrapper });

    act(() => result.current.handleOpenCreate());
    expect(result.current.formData.eventFilters).toEqual([
      "security_violation",
      "dlp_incident",
      "ueba_anomaly",
    ]);

    act(() => result.current.toggleEventFilter("auth_event"));
    expect(result.current.formData.eventFilters).toContain("auth_event");
    expect(result.current.formData.eventFilters).toHaveLength(4);

    act(() => result.current.toggleEventFilter("auth_event"));
    expect(result.current.formData.eventFilters).not.toContain("auth_event");
  });
});
