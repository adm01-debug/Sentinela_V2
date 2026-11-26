import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  ACTION_STATUS,
  VIOLATION_ACTION_META,
  actionForStatus,
  describeTransition,
  labelForAction,
  recordViolationAction,
  useRecordViolationAction,
  useViolationActions,
} from "@/hooks/useViolationActions";
import { supabase } from "@/integrations/supabase/client";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

type Call = [string, unknown[]];

function makeBuilder(chainResult: unknown, insertResult: unknown = { data: null, error: null }) {
  let current: unknown = chainResult;
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of [
    "select",
    "insert",
    "order",
    "limit",
    "eq",
    "in",
    "maybeSingle",
    "single",
  ]) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls.push([method, args]);
      if (method === "insert") current = insertResult;
      return builder;
    });
  }
  builder.then = (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve(current).then(onFulfilled, onRejected);
  return { builder, calls };
}

let actionsResult: unknown = { data: [], error: null };
let profilesResult: unknown = { data: [], error: null };
let insertResult: unknown = { data: null, error: null };
let insertPayloads: unknown[] = [];
let lastInsertPayload: unknown = null;

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeEach(() => {
  toastMock.mockClear();
  insertPayloads = [];
  lastInsertPayload = null;
  actionsResult = { data: [], error: null };
  profilesResult = { data: [], error: null };
  insertResult = { data: null, error: null };

  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: { id: "gestor-1" } },
    error: null,
  } as never);

  vi.mocked(supabase.from).mockImplementation(((table: string) => {
    if (table === "profiles") return makeBuilder(profilesResult).builder;
    if (table === "violation_actions") {
      const { builder } = makeBuilder(actionsResult, insertResult);
      const originalInsert = builder.insert as (payload: unknown) => unknown;
      builder.insert = vi.fn((payload: unknown) => {
        insertPayloads.push(payload);
        lastInsertPayload = payload;
        return originalInsert(payload);
      });
      return builder;
    }
    return makeBuilder({ data: [], error: null }).builder;
  }) as never);
});

describe("historico de acoes da violacao", () => {
  it("mapeia cada status do app para a acao registrada", () => {
    expect(actionForStatus("acknowledged")).toBe("acknowledge");
    expect(actionForStatus("investigating")).toBe("investigate");
    expect(actionForStatus("escalated")).toBe("escalate");
    expect(actionForStatus("resolved")).toBe("resolve");
    expect(actionForStatus("dismissed")).toBe("dismiss");
    expect(actionForStatus("open")).toBe("reopen");
    expect(actionForStatus("status-inexistente")).toBeNull();
    expect(actionForStatus(null)).toBeNull();
  });

  it("mantem acao e status coerentes nos dois sentidos", () => {
    (Object.keys(ACTION_STATUS) as Array<keyof typeof ACTION_STATUS>).forEach((action) => {
      const status = ACTION_STATUS[action];
      if (status === null) {
        // Advertencia nao muda status, entao nao pode voltar do status.
        expect(actionForStatus("warn")).toBeNull();
        return;
      }
      expect(actionForStatus(status)).toBe(action);
    });
  });

  it("toda acao conhecida tem rotulo legivel", () => {
    (Object.keys(VIOLATION_ACTION_META) as Array<keyof typeof VIOLATION_ACTION_META>).forEach(
      (action) => {
        expect(labelForAction(action)).toBe(VIOLATION_ACTION_META[action].label);
      }
    );
    // Tipo antigo/desconhecido nao pode virar "undefined" na tela.
    expect(labelForAction("tipo-antigo")).toBe("tipo-antigo");
  });

  it("descreve a transicao de status sem repetir status igual", () => {
    expect(describeTransition("open", "resolved")).toContain("->");
    expect(describeTransition("open", "resolved")).toBe(
      `${labelForAction("open")} -> ${labelForAction("resolved")}`
    );
    expect(describeTransition("open", "open")).toBe(labelForAction("open"));
    expect(describeTransition(null, "resolved")).toBe(labelForAction("resolved"));
    expect(describeTransition("open", null)).toBeNull();
  });

  it("grava autor, notas aparadas e status anterior/novo", async () => {
    await recordViolationAction({
      violationId: "v1",
      actionType: "warn",
      notes: "  orientado verbalmente  ",
      previousStatus: "acknowledged",
      newStatus: "acknowledged",
    });

    expect(lastInsertPayload).toEqual({
      violation_id: "v1",
      user_id: "gestor-1",
      action_type: "warn",
      notes: "orientado verbalmente",
      previous_status: "acknowledged",
      new_status: "acknowledged",
    });
  });

  it("grava notes nulo quando a justificativa vem vazia", async () => {
    await recordViolationAction({
      violationId: "v1",
      actionType: "acknowledge",
      notes: "   ",
      previousStatus: null,
      newStatus: "acknowledged",
    });

    expect((lastInsertPayload as Record<string, unknown>).notes).toBeNull();
    expect((lastInsertPayload as Record<string, unknown>).previous_status).toBeNull();
  });

  it("recusa registrar acao sem usuario autenticado", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    } as never);

    await expect(recordViolationAction({ violationId: "v1", actionType: "warn" })).rejects.toThrow(
      /autenticado/
    );
  });

  it("lista o historico com o nome de quem agiu", async () => {
    actionsResult = {
      data: [
        {
          id: "a1",
          violation_id: "v1",
          user_id: "gestor-1",
          action_type: "resolve",
          notes: null,
          previous_status: "acknowledged",
          new_status: "resolved",
          created_at: "2026-11-26T10:00:00Z",
        },
      ],
      error: null,
    };
    profilesResult = { data: [{ id: "gestor-1", full_name: "Ana Souza", email: "ana@x.com" }] };

    const { result } = renderHook(() => useViolationActions("v1"), { wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.data?.[0].author_name).toBe("Ana Souza");
    expect(result.current.data?.[0].new_status).toBe("resolved");
  });

  it("cai para o email quando o perfil nao tem nome", async () => {
    actionsResult = {
      data: [
        {
          id: "a1",
          violation_id: "v1",
          user_id: "gestor-2",
          action_type: "escalate",
          notes: null,
          previous_status: "acknowledged",
          new_status: "escalated",
          created_at: "2026-11-26T10:00:00Z",
        },
      ],
      error: null,
    };
    profilesResult = { data: [{ id: "gestor-2", full_name: null, email: "beto@x.com" }] };

    const { result } = renderHook(() => useViolationActions("v1"), { wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.data?.[0].author_name).toBe("beto@x.com");
  });

  it("avisa o gestor quando o registro da acao falha", async () => {
    insertResult = { data: null, error: { message: "permission denied" } };

    const { result } = renderHook(() => useRecordViolationAction(), { wrapper });

    await expect(
      result.current.mutateAsync({ violationId: "v1", actionType: "warn", notes: "teste" })
    ).rejects.toThrow(/permission denied/);

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" }))
    );
  });
});
