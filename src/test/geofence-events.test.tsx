import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GeofenceEventsPanel } from "@/components/geofence/GeofenceEventsPanel";
import { useGeofenceEvents } from "@/hooks/useGeofenceEvents";
import type { GeofenceEventRow, GeofenceInsideRow } from "@/hooks/useGeofenceEvents";

vi.mock("@/hooks/useGeofenceEvents", () => ({
  useGeofenceEvents: vi.fn(),
}));

const mockedHook = vi.mocked(useGeofenceEvents);

const filledEvents: GeofenceEventRow[] = [
  {
    id: "ev-1",
    employee_id: "emp-1",
    device_id: "device-1",
    geofence_id: "geo-1",
    event_type: "enter",
    occurred_at: "2026-11-26T13:00:00.000Z",
    employee_name: "Ana Souza",
    geofence_name: "Loja Centro",
  },
  {
    id: "ev-2",
    employee_id: "emp-2",
    device_id: "device-2",
    geofence_id: "geo-1",
    event_type: "exit",
    occurred_at: "2026-11-26T14:30:00.000Z",
    employee_name: "Bruno Lima",
    geofence_name: "Loja Centro",
  },
];

const filledInside: GeofenceInsideRow[] = [
  {
    employee_id: "emp-1",
    device_id: "device-1",
    geofence_id: "geo-1",
    last_checked: "2026-11-26T15:00:00.000Z",
    employee_name: "Ana Souza",
    geofence_name: "Loja Centro",
  },
];

const baseState = {
  events: [] as GeofenceEventRow[],
  inside: [] as GeofenceInsideRow[],
  isLoading: false,
  error: null as Error | null,
  refetch: vi.fn(),
};

function mockState(overrides: Partial<typeof baseState> = {}) {
  const state = { ...baseState, ...overrides };
  mockedHook.mockReturnValue(state);
  return state;
}

describe("GeofenceEventsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra os funcionários que estão dentro de uma área agora", () => {
    mockState({ inside: filledInside });

    render(<GeofenceEventsPanel />);

    expect(screen.getByText("Dentro agora")).toBeInTheDocument();
    expect(screen.getByText("Ana Souza")).toBeInTheDocument();
    expect(screen.getByText("Loja Centro")).toBeInTheDocument();
    expect(screen.getByText(/Verificado em/)).toBeInTheDocument();
  });

  it("lista entradas e saídas com área, dispositivo e horário", () => {
    mockState({ events: filledEvents });

    render(<GeofenceEventsPanel />);

    expect(screen.getByText("Entrou")).toBeInTheDocument();
    expect(screen.getByText("Saiu")).toBeInTheDocument();
    expect(screen.getByText("device-1")).toBeInTheDocument();
    expect(screen.getByText("device-2")).toBeInTheDocument();
    expect(screen.getAllByText("Loja Centro")).toHaveLength(2);
  });

  it("explica o vazio quando não há funcionário dentro de área", () => {
    mockState();

    render(<GeofenceEventsPanel />);

    expect(
      screen.getByText(/Nenhum funcionário está dentro de uma área monitorada/)
    ).toBeInTheDocument();
  });

  it("explica o vazio quando ainda não há evento registrado", () => {
    mockState();

    render(<GeofenceEventsPanel />);

    expect(screen.getByText(/Nenhum evento registrado ainda/)).toBeInTheDocument();
  });

  it("não mostra texto de vazio enquanto carrega", () => {
    mockState({ isLoading: true });

    render(<GeofenceEventsPanel />);

    expect(screen.queryByText(/Nenhum evento registrado ainda/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Nenhum funcionário está dentro de uma área monitorada/)
    ).not.toBeInTheDocument();
  });

  it("mostra o erro quando a leitura falha", () => {
    mockState({ error: new Error("permission denied") });

    render(<GeofenceEventsPanel />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("permission denied");
  });

  it("pede nova leitura ao clicar em Atualizar", async () => {
    const { refetch } = mockState();
    const user = userEvent.setup();

    render(<GeofenceEventsPanel />);
    await user.click(screen.getByRole("button", { name: /Atualizar/ }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
