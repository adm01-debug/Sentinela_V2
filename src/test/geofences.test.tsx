import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GeofencePositionCheck } from "@/components/geofence/GeofencePositionCheck";
import { useGeofencePositionCheck } from "@/hooks/useGeofencePositionCheck";
import type { GeofenceCheckResponse } from "@/services/geofenceService";

vi.mock("@/hooks/useGeofencePositionCheck", () => ({
  useGeofencePositionCheck: vi.fn(),
}));

const mockedHook = vi.mocked(useGeofencePositionCheck);

const baseState = {
  employees: [
    { id: "emp-1", name: "Ana Souza", status: "active" },
    { id: "emp-2", name: "Bruno Lima", status: "active" },
  ],
  employeesLoading: false,
  employeeId: "emp-1",
  setEmployeeId: vi.fn(),
  latitude: "-23.55052",
  longitude: "-46.63331",
  setLatitude: vi.fn(),
  setLongitude: vi.fn(),
  applyArea: vi.fn(),
  submit: vi.fn(),
  reset: vi.fn(),
  isChecking: false,
  result: null as GeofenceCheckResponse | null,
  error: null as string | null,
};

const baseResult: GeofenceCheckResponse = {
  success: true,
  violations_count: 1,
  timestamp: "2026-11-26T13:00:00.000Z",
  results: [
    { geofence_id: "geo-1", geofence_name: "Loja Centro", is_inside: true, event_type: "enter" },
    { geofence_id: "geo-2", geofence_name: "Depósito", is_inside: false },
  ],
};

const areas = [{ id: "geo-1", name: "Loja Centro", latitude: -23.55052, longitude: -46.63331 }];

function mockState(overrides: Partial<typeof baseState> = {}) {
  const state = { ...baseState, ...overrides };
  mockedHook.mockReturnValue(state);
  return state;
}

describe("GeofencePositionCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra o estado inicial e os campos preenchidos", () => {
    mockState();
    render(<GeofencePositionCheck areas={areas} />);

    expect(screen.getByText("Testar posição")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma verificação executada ainda.")).toBeInTheDocument();
    expect(screen.getByLabelText("Latitude")).toHaveValue("-23.55052");
    expect(screen.getByLabelText("Longitude")).toHaveValue("-46.63331");
  });

  it("exibe o resultado com áreas dentro e fora e o total de violações", () => {
    mockState({ result: baseResult });
    render(<GeofencePositionCheck areas={areas} />);

    expect(screen.getByText("Loja Centro")).toBeInTheDocument();
    expect(screen.getByText("Depósito")).toBeInTheDocument();
    expect(screen.getByText(/Dentro da área/)).toBeInTheDocument();
    expect(screen.getByText(/Fora da área/)).toBeInTheDocument();
    expect(screen.getByText(/1 violação\(ões\) registrada\(s\)/)).toBeInTheDocument();
  });

  it("informa quando nenhuma cerca foi avaliada", () => {
    mockState({ result: { ...baseResult, violations_count: 0, results: [] } });
    render(<GeofencePositionCheck areas={areas} />);

    expect(
      screen.getByText("Nenhuma cerca ativa foi avaliada para esta posição.")
    ).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma violação registrada/)).toBeInTheDocument();
  });

  it("dispara a verificação ao clicar no botão", async () => {
    const state = mockState();
    const user = userEvent.setup();
    render(<GeofencePositionCheck areas={areas} />);

    await user.click(screen.getByRole("button", { name: /Verificar posição/i }));

    expect(state.submit).toHaveBeenCalledTimes(1);
  });

  it("exibe erro de validação como alerta acessível", () => {
    mockState({ error: "Selecione um funcionário para verificar." });
    render(<GeofencePositionCheck areas={areas} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Selecione um funcionário para verificar.");
  });

  it("atualiza latitude e longitude digitadas", async () => {
    const state = mockState();
    const user = userEvent.setup();
    render(<GeofencePositionCheck areas={areas} />);

    const latitudeInput = screen.getByLabelText("Latitude");
    await user.clear(latitudeInput);
    await user.type(latitudeInput, "-23.6");

    expect(state.setLatitude).toHaveBeenCalled();
  });
});
