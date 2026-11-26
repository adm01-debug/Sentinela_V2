import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  KEYSTROKE_LIMIT,
  dayStartISO,
  dayEndISO,
  filterKeystrokes,
  formatKeystroke,
  keyMatches,
  labelForKey,
  summarizeKeystrokes,
  todayInput,
  useKeystrokeDetailsPage,
  type KeystrokeDetail,
} from "@/hooks/useKeystrokeDetailsPage";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

function detail(over: Partial<KeystrokeDetail>): KeystrokeDetail {
  return {
    id: "k1",
    employee_name: "Ana Silva",
    device: "PC-01",
    app_name: "chrome.exe",
    window_title: "Intranet",
    key_pressed: "a",
    key_code: 65,
    modifiers: [],
    is_sensitive: false,
    recorded_at: "2026-11-26T12:00:00Z",
    ...over,
  };
}

describe("labelForKey", () => {
  it("troca os nomes tecnicos pelos simbolos usados na tela", () => {
    expect(labelForKey("Enter")).toBe("↵");
    expect(labelForKey("Backspace")).toBe("⌫");
    expect(labelForKey("ArrowLeft")).toBe("←");
  });

  it("mantem a tecla comum como o agente enviou", () => {
    expect(labelForKey("a")).toBe("a");
    expect(labelForKey("F5")).toBe("F5");
  });
});

describe("formatKeystroke", () => {
  it("mostra a tecla simples", () => {
    expect(formatKeystroke(detail({ key_pressed: "Enter" }))).toBe("↵");
  });

  it("junta os modificadores na ordem enviada e traduz os nomes", () => {
    expect(formatKeystroke(detail({ key_pressed: "c", modifiers: ["ctrl", "shift"] }))).toBe(
      "Ctrl+Shift+c"
    );
    expect(formatKeystroke(detail({ key_pressed: "v", modifiers: ["Control"] }))).toBe("Ctrl+v");
  });

  it("aceita modificador desconhecido sem descartar a tecla", () => {
    expect(formatKeystroke(detail({ key_pressed: "x", modifiers: ["hyper"] }))).toBe("hyper+x");
  });

  it("mascara tecla de campo sensivel para nao expor senha", () => {
    const masked = formatKeystroke(
      detail({ key_pressed: "s", modifiers: ["ctrl"], is_sensitive: true })
    );
    expect(masked).toBe("•••");
    expect(masked).not.toContain("s");
  });

  it("ignora lista de modificadores vazia", () => {
    expect(formatKeystroke(detail({ key_pressed: "9", modifiers: [] }))).toBe("9");
    expect(formatKeystroke(detail({ key_pressed: "9", modifiers: null }))).toBe("9");
  });
});

describe("summarizeKeystrokes", () => {
  it("agrupa por aplicativo do mais usado para o menos usado", () => {
    const summary = summarizeKeystrokes([
      detail({ id: "1", app_name: "chrome.exe" }),
      detail({ id: "2", app_name: "excel.exe" }),
      detail({ id: "3", app_name: "chrome.exe" }),
    ]);
    expect(summary.total).toBe(3);
    expect(summary.applications).toEqual([
      { name: "chrome.exe", count: 2 },
      { name: "excel.exe", count: 1 },
    ]);
  });

  it("conta campos sensiveis e dispositivos distintos", () => {
    const summary = summarizeKeystrokes([
      detail({ id: "1", is_sensitive: true, device: "PC-01" }),
      detail({ id: "2", is_sensitive: false, device: "PC-01" }),
      detail({ id: "3", is_sensitive: true, device: "PC-02" }),
      detail({ id: "4", is_sensitive: null, device: null }),
    ]);
    expect(summary.sensitive).toBe(2);
    expect(summary.devices).toBe(2);
  });

  it("nao inventa aplicativo quando o agente nao informou", () => {
    const summary = summarizeKeystrokes([detail({ app_name: null })]);
    expect(summary.applications).toEqual([{ name: "Sem aplicativo", count: 1 }]);
  });

  it("zera tudo com lista vazia", () => {
    expect(summarizeKeystrokes([])).toEqual({
      total: 0,
      sensitive: 0,
      applications: [],
      devices: 0,
    });
  });
});

describe("keyMatches", () => {
  it("encontra pelo nome tecnico e pelo simbolo mostrado na tela", () => {
    const entry = detail({ key_pressed: "Enter" });
    expect(keyMatches(entry, "enter")).toBe(true);
    expect(keyMatches(entry, "↵")).toBe(true);
    expect(keyMatches(entry, "tab")).toBe(false);
  });

  it("termo vazio aceita qualquer tecla", () => {
    expect(keyMatches(detail({ key_pressed: "z" }), "   ")).toBe(true);
  });
});

describe("filterKeystrokes", () => {
  const entries = [
    detail({ id: "1", employee_name: "Ana Silva", app_name: "chrome.exe", key_pressed: "a" }),
    detail({
      id: "2",
      employee_name: "Bruno Souza",
      app_name: "excel.exe",
      key_pressed: "Enter",
    }),
    detail({
      id: "3",
      employee_name: "Ana Silva",
      app_name: "excel.exe",
      key_pressed: "s",
      is_sensitive: true,
    }),
  ];

  it("filtra por funcionario ignorando maiusculas e espacos", () => {
    const result = filterKeystrokes(entries, { employee: "  ana  " });
    expect(result.map((item) => item.id)).toEqual(["1", "3"]);
  });

  it("filtra por aplicativo com trecho do nome", () => {
    expect(filterKeystrokes(entries, { application: "excel" }).map((i) => i.id)).toEqual([
      "2",
      "3",
    ]);
  });

  it("combina filtros de tecla e sensivel", () => {
    expect(filterKeystrokes(entries, { onlySensitive: true }).map((i) => i.id)).toEqual(["3"]);
    expect(filterKeystrokes(entries, { key: "s", onlySensitive: true }).map((i) => i.id)).toEqual([
      "3",
    ]);
  });

  it("sem filtro devolve tudo", () => {
    expect(filterKeystrokes(entries, {})).toHaveLength(3);
  });
});

describe("janela de consulta", () => {
  it("abre o dia inteiro do inicio ao fim", () => {
    const start = dayStartISO("2026-11-26");
    const end = dayEndISO("2026-11-26");
    expect(new Date(start as string).getHours()).toBe(0);
    expect(new Date(start as string).getMinutes()).toBe(0);
    expect(new Date(end as string).getHours()).toBe(23);
    expect(new Date(end as string).getMinutes()).toBe(59);
  });

  it("devolve null para data vazia ou invalida (consulta nao dispara)", () => {
    expect(dayStartISO("")).toBeNull();
    expect(dayEndISO("   ")).toBeNull();
    expect(dayStartISO("26/11/2026")).toBeNull();
    expect(dayEndISO("nao-e-data")).toBeNull();
  });

  it("monta o campo de data com o dia atual", () => {
    expect(todayInput(new Date("2026-11-06T23:30:00"))).toBe("2026-11-06");
    expect(todayInput(new Date("2026-01-02T00:10:00"))).toBe("2026-01-02");
  });
});

type Call = [string, unknown[]];

function makeBuilder(result: unknown) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "order", "limit", "gte", "lte", "eq"]) {
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

describe("useKeystrokeDetailsPage", () => {
  let keystrokesResult: unknown = { data: [], error: null };
  let employeesResult: unknown = { data: [], error: null };
  let keystrokeCalls: Call[] = [];

  beforeEach(() => {
    keystrokesResult = { data: [], error: null };
    employeesResult = { data: [], error: null };
    keystrokeCalls = [];
    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === "employees") return makeBuilder(employeesResult).builder;
      const { builder, calls } = makeBuilder(keystrokesResult);
      keystrokeCalls = calls;
      return builder;
    }) as never);
  });

  function findCall(method: string) {
    return keystrokeCalls.find((call) => call[0] === method);
  }

  it("consulta o periodo em ordem decrescente e com o teto de registros", async () => {
    keystrokesResult = { data: [detail({ id: "1" })], error: null };
    const { result } = renderHook(() => useKeystrokeDetailsPage(), { wrapper });
    await waitFor(() => expect(result.current.allEntries).toHaveLength(1));

    expect(findCall("order")?.[1]).toEqual(["recorded_at", { ascending: false }]);
    expect(findCall("limit")?.[1]).toEqual([KEYSTROKE_LIMIT]);
    expect(findCall("gte")?.[1]?.[0]).toBe("recorded_at");
    expect(findCall("lte")?.[1]?.[0]).toBe("recorded_at");
  });

  it("filtra em memoria sem repetir a consulta no banco", async () => {
    keystrokesResult = {
      data: [
        detail({ id: "1", employee_name: "Ana Silva", app_name: "chrome.exe" }),
        detail({ id: "2", employee_name: "Bruno Souza", app_name: "excel.exe" }),
      ],
      error: null,
    };
    const { result } = renderHook(() => useKeystrokeDetailsPage(), { wrapper });
    await waitFor(() => expect(result.current.allEntries).toHaveLength(2));
    const selectsBefore = keystrokeCalls.filter((call) => call[0] === "select").length;

    act(() => result.current.setEmployee("bruno"));
    await waitFor(() => expect(result.current.entries.map((i) => i.id)).toEqual(["2"]));

    expect(result.current.summary.total).toBe(1);
    expect(keystrokeCalls.filter((call) => call[0] === "select")).toHaveLength(selectsBefore);
  });

  it("monta a lista de aplicativos a partir do que foi lido", async () => {
    keystrokesResult = {
      data: [
        detail({ id: "1", app_name: "chrome.exe" }),
        detail({ id: "2", app_name: "chrome.exe" }),
        detail({ id: "3", app_name: "excel.exe" }),
      ],
      error: null,
    };
    const { result } = renderHook(() => useKeystrokeDetailsPage(), { wrapper });
    await waitFor(() =>
      expect(result.current.applicationOptions).toEqual(["chrome.exe", "excel.exe"])
    );
  });

  it("carrega os funcionarios para o filtro", async () => {
    employeesResult = { data: [{ id: "1", name: "Ana Silva" }], error: null };
    const { result } = renderHook(() => useKeystrokeDetailsPage(), { wrapper });
    await waitFor(() => expect(result.current.employees).toEqual([{ id: "1", name: "Ana Silva" }]));
  });

  it("limpar filtros devolve a lista completa", async () => {
    keystrokesResult = { data: [detail({ id: "1" }), detail({ id: "2" })], error: null };
    const { result } = renderHook(() => useKeystrokeDetailsPage(), { wrapper });
    await waitFor(() => expect(result.current.entries).toHaveLength(2));

    act(() => {
      result.current.setEmployee("ana");
      result.current.setOnlySensitive(true);
      result.current.setKey("a");
    });
    expect(result.current.hasFilters).toBe(true);
    expect(result.current.entries).toHaveLength(0);

    act(() => result.current.clearFilters());
    expect(result.current.hasFilters).toBe(false);
    expect(result.current.entries).toHaveLength(2);
  });

  it("nao dispara consulta quando a data fica invalida", async () => {
    const { result } = renderHook(() => useKeystrokeDetailsPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setFrom(""));
    await waitFor(() => expect(result.current.allEntries).toHaveLength(0));
    expect(result.current.isLoading).toBe(false);
  });

  it("sinaliza erro quando a leitura de keystroke_details falha", async () => {
    keystrokesResult = { data: null, error: { message: "permission denied" } };
    const { result } = renderHook(() => useKeystrokeDetailsPage(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.entries).toEqual([]);
  });
});
