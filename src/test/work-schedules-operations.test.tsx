import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { toWorkSchedulePayload, type ScheduleFormData } from "@/hooks/useWorkSchedulesPage";
import {
  escalaVigenteEm,
  situacaoDaAtribuicao,
  useAssignEmployeeSchedule,
  useEmployeeSchedules,
  useRemoveEmployeeSchedule,
  type EmployeeScheduleRow,
} from "@/hooks/useEmployeeSchedules";

const from = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => from(...args),
  },
}));

interface Chain extends Record<string, unknown> {
  select: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
}

function chain(result: { data: unknown; error: unknown }): Chain {
  const obj: Record<string, unknown> = {};
  for (const metodo of ["select", "order", "insert", "delete", "update", "eq", "limit"]) {
    obj[metodo] = vi.fn(() => obj);
  }
  obj.maybeSingle = vi.fn(() => Promise.resolve(result));
  obj.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return obj as Chain;
}

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const formBase: ScheduleFormData = {
  name: " Comercial ",
  description: "",
  work_days: [1, 2, 3, 4, 5],
  start_time: "08:00",
  end_time: "17:00",
  break_start: "12:00",
  break_end: "13:00",
  flexible_start: false,
  flexible_minutes: 15,
  overtime_allowed: true,
  overtime_requires_approval: true,
  block_outside_hours: true,
};

describe("Escalas de trabalho - camada de operacoes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("converte o formulario para as colunas reais de work_schedules", () => {
    expect(toWorkSchedulePayload(formBase)).toEqual({
      name: "Comercial",
      description: null,
      work_days: [1, 2, 3, 4, 5],
      start_time: "08:00",
      end_time: "17:00",
      allow_overtime: true,
      auto_block_enabled: true,
      lunch_start: "12:00",
      lunch_end: "13:00",
    });
  });

  it("le as atribuicoes com nome do funcionario e da escala", async () => {
    from.mockReturnValue(
      chain({
        data: [
          {
            id: "a1",
            employee_id: "e1",
            schedule_id: "s1",
            effective_from: "2026-11-25",
            effective_until: null,
            employees: { name: "Joao Silva" },
            work_schedules: { name: "Comercial" },
          },
          {
            id: "a2",
            employee_id: "e2",
            schedule_id: "s2",
            effective_from: "2026-11-20",
            effective_until: "2026-12-01",
            employees: null,
            work_schedules: null,
          },
        ],
        error: null,
      })
    );

    const { result } = renderHook(() => useEmployeeSchedules(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(from).toHaveBeenCalledWith("employee_schedules");
    expect(result.current.data).toEqual([
      {
        id: "a1",
        employee_id: "e1",
        schedule_id: "s1",
        effective_from: "2026-11-25",
        effective_until: null,
        employee_name: "Joao Silva",
        schedule_name: "Comercial",
      },
      {
        id: "a2",
        employee_id: "e2",
        schedule_id: "s2",
        effective_from: "2026-11-20",
        effective_until: "2026-12-01",
        employee_name: null,
        schedule_name: null,
      },
    ]);
  });

  it("grava a atribuicao em employee_schedules", async () => {
    const tabela = chain({ data: { id: "novo" }, error: null });
    from.mockReturnValue(tabela);

    const { result } = renderHook(() => useAssignEmployeeSchedule(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        employee_id: "e1",
        schedule_id: "s1",
        effective_from: "2026-11-25",
      });
    });

    expect(from).toHaveBeenCalledWith("employee_schedules");
    expect(tabela.insert).toHaveBeenCalledWith({
      employee_id: "e1",
      schedule_id: "s1",
      effective_from: "2026-11-25",
    });
  });

  it("remove a atribuicao pelo id", async () => {
    const tabela = chain({ data: null, error: null });
    from.mockReturnValue(tabela);

    const { result } = renderHook(() => useRemoveEmployeeSchedule(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync("a1");
    });

    expect(tabela.delete).toHaveBeenCalled();
    expect(tabela.eq).toHaveBeenCalledWith("id", "a1");
  });
});

// ============================================================
// ESCALA VIGENTE NA DATA
// ============================================================

function atribuicao(campos: Partial<EmployeeScheduleRow> & { id: string }): EmployeeScheduleRow {
  return {
    employee_id: "e1",
    schedule_id: "s1",
    effective_from: "2026-01-01",
    effective_until: null,
    employee_name: "Joao Silva",
    schedule_name: "Comercial",
    ...campos,
  };
}

describe("Escala vigente na data escolhida", () => {
  const nova = atribuicao({ id: "a-nova", schedule_id: "s-nova", effective_from: "2026-11-20" });
  const antiga = atribuicao({
    id: "a-antiga",
    schedule_id: "s-antiga",
    effective_from: "2026-01-01",
    effective_until: "2026-11-19",
  });
  const futura = atribuicao({
    id: "a-futura",
    schedule_id: "s-futura",
    effective_from: "2026-12-01",
  });

  it("escolhe a atribuicao mais recente que ja comecou", () => {
    expect(escalaVigenteEm([antiga, nova], "e1", "2026-11-25")?.id).toBe("a-nova");
  });

  it("ignora a atribuicao que ainda nao comecou", () => {
    expect(escalaVigenteEm([antiga, nova, futura], "e1", "2026-11-25")?.id).toBe("a-nova");
  });

  it("respeita o fim da vigencia e devolve a anterior quando ela encerrou", () => {
    const novaEncerrada = atribuicao({
      id: "a-encerrada",
      effective_from: "2026-10-01",
      effective_until: "2026-11-10",
    });
    const antes = atribuicao({ id: "a-antes", effective_from: "2026-01-01" });

    expect(escalaVigenteEm([antes, novaEncerrada], "e1", "2026-11-25")?.id).toBe("a-antes");
    expect(escalaVigenteEm([antes, novaEncerrada], "e1", "2026-11-30")).toBe(antes);
  });

  it("nao mistura funcionarios", () => {
    const doOutro = atribuicao({ id: "a-e2", employee_id: "e2", effective_from: "2026-11-24" });
    const minha = atribuicao({ id: "a-minha", effective_from: "2026-11-10" });

    expect(escalaVigenteEm([minha, doOutro], "e1", "2026-11-25")?.id).toBe("a-minha");
    expect(escalaVigenteEm([minha, doOutro], "e2", "2026-11-25")?.id).toBe("a-e2");
  });

  it("devolve null quando o funcionario nao tem escala em vigor", () => {
    expect(escalaVigenteEm([antiga, futura], "e1", "2026-11-25")).toBeNull();
    expect(escalaVigenteEm([], "e1", "2026-11-25")).toBeNull();
  });

  it("aceita data com horario no effective_from", () => {
    const comHora = atribuicao({ id: "a-hora", effective_from: "2026-11-20T09:30:00Z" });
    expect(escalaVigenteEm([comHora], "e1", "2026-11-25")?.id).toBe("a-hora");
  });

  it("classifica cada atribuicao em relacao a data", () => {
    const todas = [antiga, nova, futura];

    expect(situacaoDaAtribuicao(nova, todas, "2026-11-25")).toBe("vigente");
    expect(situacaoDaAtribuicao(antiga, todas, "2026-11-25")).toBe("encerrada");
    expect(situacaoDaAtribuicao(futura, todas, "2026-11-25")).toBe("futura");

    const substituida = atribuicao({ id: "a-substituida", effective_from: "2026-05-01" });
    expect(situacaoDaAtribuicao(substituida, [substituida, nova], "2026-11-25")).toBe(
      "substituida"
    );
  });
});
