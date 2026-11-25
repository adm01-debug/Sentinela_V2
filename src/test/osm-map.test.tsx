import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  OsmMap,
  fitZoom,
  isValidCoordinate,
  projectToWorld,
  type OsmMapMarker,
} from "@/components/map/OsmMap";
import { MobileDevicesMap } from "@/components/MobileDevicesMap";

const saoPaulo: OsmMapMarker = {
  id: "sp",
  latitude: -23.5505,
  longitude: -46.6333,
  label: "Funcionario SP",
};

describe("OsmMap", () => {
  it("valida coordenadas dentro do intervalo do Web Mercator", () => {
    expect(isValidCoordinate(-23.55, -46.63)).toBe(true);
    expect(isValidCoordinate(90, 10)).toBe(false);
    expect(isValidCoordinate(10, 200)).toBe(false);
    expect(isValidCoordinate(Number.NaN, 10)).toBe(false);
  });

  it("projeta o centro do mundo no meio da imagem de tiles", () => {
    const world = projectToWorld(0, 0, 0);
    expect(world.x).toBeCloseTo(128, 5);
    expect(world.y).toBeCloseTo(128, 5);
  });

  it("escolhe o zoom para caber todos os marcadores", () => {
    expect(fitZoom([saoPaulo])).toBe(13);
    const espalhados: OsmMapMarker[] = [
      { id: "a", latitude: -23.5, longitude: -46.6, label: "a" },
      { id: "b", latitude: -22.9, longitude: -43.2, label: "b" },
    ];
    expect(fitZoom(espalhados)).toBeLessThan(13);
  });

  it("renderiza os tiles do OSM no zoom calculado", () => {
    render(<OsmMap markers={[saoPaulo]} />);
    const tiles = screen.getAllByTestId("osm-map-tile");
    expect(tiles.length).toBeGreaterThan(0);
    const zooms = new Set(
      tiles.map((tile) => Number(tile.getAttribute("src")?.split("/")[3] ?? -1))
    );
    expect(zooms.size).toBe(1);
    expect([...zooms][0]).toBe(13);
    tiles.forEach((tile) => {
      expect(tile.getAttribute("src")).toMatch(
        /^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/
      );
    });
  });

  it("dispara o clique do marcador com o id do ponto", () => {
    const onMarkerClick = vi.fn();
    render(<OsmMap markers={[saoPaulo]} onMarkerClick={onMarkerClick} />);
    fireEvent.click(screen.getByLabelText("Funcionario SP"));
    expect(onMarkerClick).toHaveBeenCalledWith("sp");
  });

  it("marca o ponto selecionado", () => {
    render(<OsmMap markers={[saoPaulo]} selectedId="sp" />);
    expect(screen.getByLabelText("Funcionario SP").getAttribute("aria-pressed")).toBe("true");
  });

  it("mostra estado vazio sem carregar tiles quando nao ha ponto valido", () => {
    render(
      <OsmMap markers={[{ id: "x", latitude: Number.NaN, longitude: 10, label: "invalido" }]} />
    );
    expect(screen.getByTestId("osm-map-empty")).toBeTruthy();
    expect(screen.queryAllByTestId("osm-map-tile")).toHaveLength(0);
  });
});

describe("MobileDevicesMap", () => {
  const devices = [
    {
      id: "1",
      device_id: "dev-1",
      employee_name: "Ana",
      is_online: true,
      last_location: { lat: -23.55, lng: -46.63 },
    },
    { id: "2", device_id: "dev-2", employee_name: "Bruno", is_online: false },
  ];

  it("so vira marcador o aparelho com localizacao conhecida", () => {
    render(<MobileDevicesMap devices={devices} />);
    expect(screen.getAllByTestId("osm-map-marker")).toHaveLength(1);
    expect(screen.getByLabelText(/Ana/)).toBeTruthy();
    expect(screen.queryByLabelText(/Bruno/)).toBeNull();
    expect(screen.getByText(/1 de 2 aparelho/i)).toBeTruthy();
  });

  it("devolve o aparelho clicado para abrir as atividades", () => {
    const onDeviceClick = vi.fn();
    render(<MobileDevicesMap devices={devices} onDeviceClick={onDeviceClick} />);
    fireEvent.click(screen.getByLabelText(/Ana/));
    expect(onDeviceClick).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
  });

  it("avisa quando nenhum aparelho enviou localizacao", () => {
    render(<MobileDevicesMap devices={[devices[1]]} />);
    expect(screen.getByText(/Nenhum aparelho enviou localizacao/i)).toBeTruthy();
  });
});
