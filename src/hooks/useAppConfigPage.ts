import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  configToRow,
  defaultConfig,
  rowToConfig,
  type AppConfig,
  type AppConfigRow,
} from "@/hooks/useAppConfig";

export const MIN_UPLOAD_MB = 1;
export const MAX_UPLOAD_MB = 1024;
export const MIN_SESSION_MINUTES = 5;
export const MAX_SESSION_MINUTES = 1440;
export const MAINTENANCE_MESSAGE_MAX_LENGTH = 500;
export const LANGUAGES = ["pt-BR", "en", "es"] as const;

// A tela edita em MB/minutos; o banco guarda bytes/segundos.
const BYTES_PER_MB = 1048576;
const SECONDS_PER_MINUTE = 60;

export interface AppConfigForm {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  mfaRequired: boolean;
  maxUploadMb: string;
  sessionTimeoutMinutes: string;
  allowedIps: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  primaryColor: string;
  secondaryColor: string;
}

export const EMPTY_APP_CONFIG_FORM: AppConfigForm = {
  maintenanceMode: false,
  maintenanceMessage: "",
  mfaRequired: false,
  maxUploadMb: "10",
  sessionTimeoutMinutes: "60",
  allowedIps: "",
  defaultLanguage: "pt-BR",
  supportedLanguages: ["pt-BR", "en", "es"],
  primaryColor: "#1890ff",
  secondaryColor: "#52c41a",
};

export function formFromConfig(config: AppConfig): AppConfigForm {
  return {
    maintenanceMode: config.maintenanceMode,
    maintenanceMessage: config.maintenanceMessage ?? "",
    mfaRequired: config.mfaRequired,
    maxUploadMb: String(Math.round(config.maxUploadSize / BYTES_PER_MB)),
    sessionTimeoutMinutes: String(Math.round(config.sessionTimeout / SECONDS_PER_MINUTE)),
    allowedIps: (config.allowedIPs ?? []).join("\n"),
    defaultLanguage: config.defaultLanguage,
    supportedLanguages: config.supportedLanguages,
    primaryColor: config.theme.primaryColor,
    secondaryColor: config.theme.secondaryColor,
  };
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6 = /^[0-9a-fA-F:]{2,45}$/;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export type IpParseResult = { ok: true; value: string[] } | { ok: false; error: string };

export function parseIpList(text: string): IpParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const unique: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    const value = lines[index];
    if (!IPV4.test(value) && !(value.includes(":") && IPV6.test(value))) {
      return { ok: false, error: `IP invalido na linha ${index + 1}: ${value}` };
    }
    if (!unique.includes(value)) unique.push(value);
  }
  return { ok: true, value: unique };
}

function parseBoundedInt(
  text: string,
  min: number,
  max: number,
  label: string
): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return { ok: false, error: `${label} deve ser um numero inteiro` };
  const value = Number(trimmed);
  if (value < min || value > max) {
    return { ok: false, error: `${label} deve ficar entre ${min} e ${max}` };
  }
  return { ok: true, value };
}

export type AppConfigFormErrors = Partial<Record<keyof AppConfigForm, string>>;

export function validateAppConfigForm(form: AppConfigForm): AppConfigFormErrors {
  const errors: AppConfigFormErrors = {};
  const message = form.maintenanceMessage.trim();

  if (form.maintenanceMode && message.length === 0) {
    errors.maintenanceMessage = "Informe a mensagem que o usuario vera durante a manutencao";
  } else if (message.length > MAINTENANCE_MESSAGE_MAX_LENGTH) {
    errors.maintenanceMessage = `Mensagem deve ter no maximo ${MAINTENANCE_MESSAGE_MAX_LENGTH} caracteres`;
  }

  const upload = parseBoundedInt(
    form.maxUploadMb,
    MIN_UPLOAD_MB,
    MAX_UPLOAD_MB,
    "Limite de upload (MB)"
  );
  if (!upload.ok) errors.maxUploadMb = upload.error;

  const timeout = parseBoundedInt(
    form.sessionTimeoutMinutes,
    MIN_SESSION_MINUTES,
    MAX_SESSION_MINUTES,
    "Timeout de sessao (min)"
  );
  if (!timeout.ok) errors.sessionTimeoutMinutes = timeout.error;

  const ips = parseIpList(form.allowedIps);
  if (!ips.ok) errors.allowedIps = ips.error;

  if (form.supportedLanguages.length === 0) {
    errors.supportedLanguages = "Selecione pelo menos um idioma suportado";
  } else if (!form.supportedLanguages.includes(form.defaultLanguage)) {
    errors.defaultLanguage = "O idioma padrao precisa estar entre os idiomas suportados";
  }

  if (!HEX_COLOR.test(form.primaryColor)) {
    errors.primaryColor = "Cor primaria deve estar no formato #rrggbb";
  }
  if (!HEX_COLOR.test(form.secondaryColor)) {
    errors.secondaryColor = "Cor secundaria deve estar no formato #rrggbb";
  }

  return errors;
}

export function configFromForm(form: AppConfigForm): Partial<AppConfig> {
  const ips = parseIpList(form.allowedIps);
  return {
    maintenanceMode: form.maintenanceMode,
    maintenanceMessage: form.maintenanceMessage.trim() || undefined,
    maxUploadSize: Number(form.maxUploadMb.trim()) * BYTES_PER_MB,
    sessionTimeout: Number(form.sessionTimeoutMinutes.trim()) * SECONDS_PER_MINUTE,
    mfaRequired: form.mfaRequired,
    defaultLanguage: form.defaultLanguage,
    supportedLanguages: form.supportedLanguages,
    allowedIPs: ips.ok ? ips.value : [],
    theme: { primaryColor: form.primaryColor, secondaryColor: form.secondaryColor },
  };
}

export interface AppConfigSummary {
  maintenanceActive: boolean;
  mfaRequired: boolean;
  uploadMb: number;
  sessionMinutes: number;
  allowedIpsCount: number;
  languagesCount: number;
}

export function summarizeAppConfig(config: AppConfig): AppConfigSummary {
  return {
    maintenanceActive: config.maintenanceMode,
    mfaRequired: config.mfaRequired,
    uploadMb: Math.round(config.maxUploadSize / BYTES_PER_MB),
    sessionMinutes: Math.round(config.sessionTimeout / SECONDS_PER_MINUTE),
    allowedIpsCount: (config.allowedIPs ?? []).length,
    languagesCount: config.supportedLanguages.length,
  };
}

// O PostgrestError do supabase nao e instancia de Error; sem isto a tela mostrava
// "Erro desconhecido" em qualquer falha do banco.
export function messageOf(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return null;
}

export function useAppConfigPage() {
  const { toast } = useToast();
  const [draft, setDraft] = useState<AppConfigForm | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const configQuery = useQuery({
    queryKey: ["app-config-page"],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const userId = userData?.user?.id ?? null;

      let companyId: string | null = null;
      if (userId) {
        const { data: rpcData } = await supabase.rpc("get_user_company_id", { _user_id: userId });
        companyId = (rpcData as string | null) ?? null;
      }

      const base = supabase.from("app_config").select("*");
      const scoped = companyId ? base.eq("company_id", companyId) : base.is("company_id", null);
      const { data, error } = await scoped.order("updated_at", { ascending: false }).limit(1);
      if (error) throw error;

      const row = ((data ?? []) as AppConfigRow[])[0];
      return {
        config: row ? rowToConfig(row) : defaultConfig,
        existingId: row?.id ?? null,
        companyId,
        userId,
      };
    },
  });

  const config = configQuery.data?.config ?? null;
  const existingId = configQuery.data?.existingId ?? null;
  const companyId = configQuery.data?.companyId ?? null;
  const userId = configQuery.data?.userId ?? null;

  const savedForm = configQuery.data
    ? formFromConfig(configQuery.data.config)
    : EMPTY_APP_CONFIG_FORM;
  // O rascunho vive so na tela: enquanto ele existe, o formulario nao e
  // sobrescrito por um refetch. Sem efeito de sincronizacao.
  const form = draft ?? savedForm;
  const dirty = draft !== null;

  const errors = useMemo(() => validateAppConfigForm(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  const setForm = (patch: Partial<AppConfigForm>) => {
    setDraft({ ...form, ...patch });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const current = config ?? defaultConfig;
      const payload: Record<string, unknown> = {
        ...configToRow(configFromForm(form)),
        features: current.features,
        company_id: companyId,
        updated_by: userId,
      };

      if (existingId) {
        const { error } = await supabase
          .from("app_config")
          .update(payload as never)
          .eq("id", existingId);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("app_config").insert(payload as never);
      if (error) throw error;
    },
    onSuccess: async () => {
      setDraft(null);
      await configQuery.refetch();
      toast({
        title: "Configuracoes salvas",
        description: "As novas configuracoes ja valem para esta empresa.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Nao foi possivel salvar",
        description: messageOf(error) ?? "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const submit = () => {
    setShowErrors(true);
    if (hasErrors) return;
    saveMutation.mutate();
  };

  const reset = () => {
    setDraft(null);
    setShowErrors(false);
  };

  return {
    config,
    companyId,
    form,
    setForm,
    reset,
    dirty,
    errors,
    showErrors,
    hasErrors,
    isLoading: configQuery.isLoading,
    isError: configQuery.isError,
    errorMessage: messageOf(configQuery.error),
    isSaving: saveMutation.isPending,
    existingId,
    hasRow: existingId !== null,
    submit,
  };
}
