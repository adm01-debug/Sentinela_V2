import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  EMPTY_APP_CONFIG_FORM,
  MAINTENANCE_MESSAGE_MAX_LENGTH,
  configFromForm,
  formFromConfig,
  parseIpList,
  summarizeAppConfig,
  useAppConfigPage,
  validateAppConfigForm,
} from "@/hooks/useAppConfigPage";
import { defaultConfig, type AppConfig } from "@/hooks/useAppConfig";
import { supabase } from "@/integrations/supabase/client";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

function config(over: Partial<AppConfig> = {}): AppConfig {
  return { ...defaultConfig, ...over };
}

type Call = [string, unknown[]];

function makeBuilder(result: unknown) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "insert", "update", "delete", "eq", "is", "order", "limit"]) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    });
  }
  builder.then = (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled, onRejected);
  return { builder, calls };
}

function row(over: Record<string, unknown> = {}) {
  return {
    id: "cfg-1",
    company_id: "company-1",
    maintenance_mode: false,
    maintenance_message: null,
    allowed_ips: [],
    max_upload_size: 10485760,
    session_timeout: 3600,
    mfa_required: false,
    default_language: "pt-BR",
    supported_languages: ["pt-BR", "en", "es"],
    theme: { primaryColor: "#1890ff", secondaryColor: "#52c41a" },
    features: {},
    updated_by: null,
    created_at: "2026-11-01T10:00:00Z",
    updated_at: "2026-11-02T10:00:00Z",
    ...over,
  };
}

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeEach(() => {
  toastMock.mockClear();
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: { id: "user-1" } },
    error: null,
  } as never);
  vi.mocked(supabase.rpc).mockResolvedValue({ data: "company-1", error: null } as never);
});

describe("formFromConfig", () => {
  it("converte bytes em MB e segundos em minutos", () => {
    const form = formFromConfig(config({ maxUploadSize: 20971520, sessionTimeout: 1800 }));
    expect(form.maxUploadMb).toBe("20");
    expect(form.sessionTimeoutMinutes).toBe("30");
  });

  it("junta os IPs com quebra de linha e usa o tema salvo", () => {
    const form = formFromConfig(
      config({
        allowedIPs: ["200.10.20.30", "177.40.0.1"],
        theme: { primaryColor: "#111111", secondaryColor: "#222222" },
      })
    );
    expect(form.allowedIps).toBe("200.10.20.30\n177.40.0.1");
    expect(form.primaryColor).toBe("#111111");
    expect(form.secondaryColor).toBe("#222222");
  });
});

describe("parseIpList", () => {
  it("lista vazia significa sem restricao", () => {
    expect(parseIpList("  \n\n ")).toEqual({ ok: true, value: [] });
  });

  it("aceita IPv4, IPv6 e remove repetidos", () => {
    const result = parseIpList("200.10.20.30\n200.10.20.30\n::1");
    expect(result).toEqual({ ok: true, value: ["200.10.20.30", "::1"] });
  });

  it("recusa valor invalido apontando a linha", () => {
    const result = parseIpList("200.10.20.30\nnao-e-ip");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("IP invalido na linha 2: nao-e-ip");
  });

  it("recusa octeto fora da faixa", () => {
    expect(parseIpList("999.1.1.1").ok).toBe(false);
  });
});

describe("validateAppConfigForm", () => {
  it("formulario padrao nao tem erro", () => {
    expect(validateAppConfigForm(EMPTY_APP_CONFIG_FORM)).toEqual({});
  });

  it("exige mensagem quando o modo de manutencao esta ligado", () => {
    const errors = validateAppConfigForm({ ...EMPTY_APP_CONFIG_FORM, maintenanceMode: true });
    expect(errors.maintenanceMessage).toContain("mensagem");
  });

  it(`recusa mensagem acima de ${MAINTENANCE_MESSAGE_MAX_LENGTH} caracteres`, () => {
    const errors = validateAppConfigForm({
      ...EMPTY_APP_CONFIG_FORM,
      maintenanceMessage: "a".repeat(MAINTENANCE_MESSAGE_MAX_LENGTH + 1),
    });
    expect(errors.maintenanceMessage).toContain(String(MAINTENANCE_MESSAGE_MAX_LENGTH));
  });

  it("recusa upload e timeout fora do intervalo", () => {
    const errors = validateAppConfigForm({
      ...EMPTY_APP_CONFIG_FORM,
      maxUploadMb: "0",
      sessionTimeoutMinutes: "2",
    });
    expect(errors.maxUploadMb).toContain("entre 1 e 1024");
    expect(errors.sessionTimeoutMinutes).toContain("entre 5 e 1440");
  });

  it("recusa texto nao numerico", () => {
    const errors = validateAppConfigForm({ ...EMPTY_APP_CONFIG_FORM, maxUploadMb: "10MB" });
    expect(errors.maxUploadMb).toBe("Limite de upload (MB) deve ser um numero inteiro");
  });

  it("recusa idioma padrao fora dos suportados", () => {
    const errors = validateAppConfigForm({
      ...EMPTY_APP_CONFIG_FORM,
      supportedLanguages: ["pt-BR"],
      defaultLanguage: "en",
    });
    expect(errors.defaultLanguage).toContain("idioma padrao");
  });

  it("exige pelo menos um idioma suportado", () => {
    const errors = validateAppConfigForm({ ...EMPTY_APP_CONFIG_FORM, supportedLanguages: [] });
    expect(errors.supportedLanguages).toContain("pelo menos um idioma");
  });

  it("recusa cor fora do formato hex", () => {
    const errors = validateAppConfigForm({ ...EMPTY_APP_CONFIG_FORM, primaryColor: "azul" });
    expect(errors.primaryColor).toContain("#rrggbb");
  });
});

describe("configFromForm", () => {
  it("converte MB para bytes e minutos para segundos", () => {
    const partial = configFromForm({
      ...EMPTY_APP_CONFIG_FORM,
      maxUploadMb: "25",
      sessionTimeoutMinutes: "45",
    });
    expect(partial.maxUploadSize).toBe(26214400);
    expect(partial.sessionTimeout).toBe(2700);
  });

  it("mensagem vazia vira indefinida e IPs viram lista", () => {
    const partial = configFromForm({
      ...EMPTY_APP_CONFIG_FORM,
      maintenanceMessage: "   ",
      allowedIps: "200.10.20.30",
    });
    expect(partial.maintenanceMessage).toBeUndefined();
    expect(partial.allowedIPs).toEqual(["200.10.20.30"]);
  });
});

describe("summarizeAppConfig", () => {
  it("resume o estado salvo em unidades legiveis", () => {
    const summary = summarizeAppConfig(
      config({
        maintenanceMode: true,
        mfaRequired: true,
        maxUploadSize: 5242880,
        sessionTimeout: 900,
        allowedIPs: ["10.0.0.1"],
      })
    );
    expect(summary).toEqual({
      maintenanceActive: true,
      mfaRequired: true,
      uploadMb: 5,
      sessionMinutes: 15,
      allowedIpsCount: 1,
      languagesCount: 3,
    });
  });
});

describe("useAppConfigPage", () => {
  it("carrega a config da empresa do usuario via get_user_company_id", async () => {
    const { builder, calls } = makeBuilder({
      data: [row({ maintenance_mode: true, maintenance_message: "Voltamos as 22h" })],
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useAppConfigPage(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(vi.mocked(supabase.rpc)).toHaveBeenCalledWith("get_user_company_id", {
      _user_id: "user-1",
    });
    expect(calls).toContainEqual(["eq", ["company_id", "company-1"]]);
    expect(result.current.hasRow).toBe(true);
    expect(result.current.form.maintenanceMode).toBe(true);
    expect(result.current.form.maintenanceMessage).toBe("Voltamos as 22h");
  });

  it("sem linha no banco usa os padroes e sinaliza que nada foi criado", async () => {
    const { builder, calls } = makeBuilder({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useAppConfigPage(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasRow).toBe(false);
    expect(result.current.form.maxUploadMb).toBe("10");
    expect(calls).toContainEqual(["limit", [1]]);
  });

  it("bloqueia o envio quando ha erro de validacao", async () => {
    const { builder, calls } = makeBuilder({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useAppConfigPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setForm({ maxUploadMb: "0" }));
    act(() => result.current.submit());

    expect(result.current.showErrors).toBe(true);
    expect(calls.some(([method]) => method === "insert")).toBe(false);
    expect(calls.some(([method]) => method === "update")).toBe(false);
  });

  it("atualiza a linha existente em vez de criar outra", async () => {
    const { builder, calls } = makeBuilder({ data: [row()], error: null });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useAppConfigPage(), { wrapper });
    await waitFor(() => expect(result.current.hasRow).toBe(true));

    act(() => result.current.setForm({ sessionTimeoutMinutes: "90", mfaRequired: true }));
    act(() => result.current.submit());

    await waitFor(() => expect(result.current.isSaving).toBe(false));

    expect(calls.some(([method]) => method === "insert")).toBe(false);
    expect(calls).toContainEqual(["eq", ["id", "cfg-1"]]);
    const updateCall = calls.find(([method]) => method === "update");
    const payload = updateCall?.[1][0] as Record<string, unknown>;
    expect(payload.session_timeout).toBe(5400);
    expect(payload.mfa_required).toBe(true);
    expect(payload.company_id).toBe("company-1");
    expect(payload.updated_by).toBe("user-1");
    expect(toastMock).toHaveBeenCalled();
  });

  it("cria a linha quando o escopo ainda nao tem configuracao", async () => {
    const { builder, calls } = makeBuilder({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useAppConfigPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setForm({ maxUploadMb: "50" }));
    act(() => result.current.submit());

    await waitFor(() => expect(result.current.isSaving).toBe(false));

    const insertCall = calls.find(([method]) => method === "insert");
    expect(insertCall).toBeDefined();
    const payload = insertCall?.[1][0] as Record<string, unknown>;
    expect(payload.max_upload_size).toBe(52428800);
    expect(payload.company_id).toBe("company-1");
    expect(calls.some(([method]) => method === "update")).toBe(false);
  });

  it("avisa o usuario quando o banco recusa o salvamento", async () => {
    const { builder } = makeBuilder({ data: [], error: { message: "permission denied" } });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useAppConfigPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setForm({ maxUploadMb: "50" }));
    act(() => result.current.submit());

    await waitFor(() => expect(result.current.isSaving).toBe(false));

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Nao foi possivel salvar", variant: "destructive" })
    );
  });

  it("descartar rascunho volta ao valor salvo", async () => {
    const { builder } = makeBuilder({ data: [row({ max_upload_size: 5242880 })], error: null });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useAppConfigPage(), { wrapper });
    await waitFor(() => expect(result.current.form.maxUploadMb).toBe("5"));

    act(() => result.current.setForm({ maxUploadMb: "99" }));
    expect(result.current.dirty).toBe(true);

    act(() => result.current.reset());
    expect(result.current.form.maxUploadMb).toBe("5");
    expect(result.current.dirty).toBe(false);
  });

  it("erro de leitura vira estado de erro com mensagem", async () => {
    const { builder } = makeBuilder({ data: null, error: { message: "PGRST205" } });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    const { result } = renderHook(() => useAppConfigPage(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe("PGRST205");
  });
});
