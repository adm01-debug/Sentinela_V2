import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PolicyAcknowledgmentDialog } from "@/components/PolicyAcknowledgmentDialog";

const UID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const upload = vi.fn().mockResolvedValue({ error: null });
const createSignedUrl = vi.fn().mockResolvedValue({
  data: { signedUrl: "https://cdn/x.jpg?sig=abc" },
  error: null,
});
const insert = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: { from: () => ({ upload, createSignedUrl }) },
    from: () => ({ insert }),
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", email: "ti@x.com", name: "TI" },
  }),
}));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));

describe("PolicyAcknowledgmentDialog - caminho do upload", () => {
  beforeEach(() => {
    upload.mockClear();
    createSignedUrl.mockClear();
    insert.mockClear();
  });

  it("envia a foto para a pasta do usuario autenticado", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) },
    });
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (ok: (p: unknown) => void) =>
          ok({ coords: { latitude: -23.5, longitude: -46.6 } }),
      },
    });
    HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
      configurable: true,
      get: () => 120,
    });
    Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
      configurable: true,
      get: () => 120,
    });
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/jpeg;base64,AAAA");
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(["x"])),
    }) as unknown as typeof globalThis.fetch;

    render(<PolicyAcknowledgmentDialog employeeName="TI Suporte" />);

    fireEvent.click(screen.getByRole("button", { name: /Aceitar Pol/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Iniciar Captura/i }));

    await waitFor(() => expect(screen.getByText(/Posicione seu rosto/i)).toBeTruthy());

    fireEvent.click(await screen.findByRole("button", { name: /Capturar Foto/i }));

    await waitFor(() => expect(screen.getByText(/Verifique os dados/i)).toBeTruthy(), {
      timeout: 4000,
    });

    fireEvent.click(screen.getByRole("button", { name: /Confirmar Aceita/i }));

    await waitFor(() => expect(upload).toHaveBeenCalled(), { timeout: 4000 });
    await waitFor(() => expect(insert).toHaveBeenCalled(), { timeout: 4000 });

    expect(upload).toHaveBeenCalledTimes(1);
    const caminho = String(upload.mock.calls[0][0]);
    expect(caminho).toContain(`${UID}/`);
    expect(caminho.endsWith(".jpg")).toBe(true);
  });

  it("grava a URL assinada, e nao a URL publica de um bucket privado", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) },
    });
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (ok: (p: unknown) => void) =>
          ok({ coords: { latitude: -23.5, longitude: -46.6 } }),
      },
    });
    HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
      configurable: true,
      get: () => 120,
    });
    Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
      configurable: true,
      get: () => 120,
    });
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/jpeg;base64,AAAA");
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(["x"])),
    }) as unknown as typeof globalThis.fetch;

    render(<PolicyAcknowledgmentDialog employeeName="TI Suporte" />);

    fireEvent.click(screen.getByRole("button", { name: /Aceitar Pol/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Iniciar Captura/i }));
    await waitFor(() => expect(screen.getByText(/Posicione seu rosto/i)).toBeTruthy());
    fireEvent.click(await screen.findByRole("button", { name: /Capturar Foto/i }));
    await waitFor(() => expect(screen.getByText(/Verifique os dados/i)).toBeTruthy(), {
      timeout: 4000,
    });
    fireEvent.click(screen.getByRole("button", { name: /Confirmar Aceita/i }));

    await waitFor(() => expect(insert).toHaveBeenCalled(), { timeout: 4000 });

    const registro = insert.mock.calls[0][0] as { photo_url: string };
    expect(registro.photo_url).toBe("https://cdn/x.jpg?sig=abc");
    expect(createSignedUrl).toHaveBeenCalled();
  });
});
