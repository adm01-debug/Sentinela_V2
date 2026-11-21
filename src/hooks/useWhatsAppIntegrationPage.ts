import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WhatsAppConfig {
  id: string;
  provider: "meta" | "evolution";
  phone_number_id: string;
  business_account_id: string;
  access_token: string;
  webhook_verify_token: string;
  evolution_api_url: string;
  evolution_instance_token: string;
  evolution_instance_name: string;
  is_active: boolean;
  created_at: string;
}

type WhatsAppConfigInput = {
  provider: "meta" | "evolution";
  phone_number_id: string;
  business_account_id: string;
  access_token: string;
  webhook_verify_token: string;
  evolution_api_url: string;
  evolution_instance_token: string;
  evolution_instance_name: string;
  is_active: boolean;
};

export interface WhatsAppMessage {
  id: string;
  to: string;
  from: string;
  type: "text" | "template" | "image" | "document";
  content: string;
  status: "sent" | "delivered" | "read" | "failed";
  created_at: string;
  error_message?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  status: "approved" | "pending" | "rejected";
  category: string;
  body?: string;
}

const initialConfig: WhatsAppConfigInput = {
  provider: "meta",
  phone_number_id: "",
  business_account_id: "",
  access_token: "",
  webhook_verify_token: "",
  evolution_api_url: "",
  evolution_instance_token: "",
  evolution_instance_name: "PRINCIPAL",
  is_active: false,
};

export function useWhatsAppIntegrationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("config");
  const [configData, setConfigData] = useState<WhatsAppConfigInput>(initialConfig);
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [messageFilter, setMessageFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);

  const { data: config, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["whatsapp-config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_config").select("*").maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        provider: data.provider === "evolution" ? "evolution" : "meta",
        phone_number_id: data.phone_number_id || "",
        business_account_id: data.business_account_id || "",
        access_token: data.access_token || "",
        webhook_verify_token: data.webhook_verify_token || "",
        evolution_api_url: data.evolution_api_url || "",
        evolution_instance_token: data.evolution_instance_token || "",
        evolution_instance_name: data.evolution_instance_name || "PRINCIPAL",
        is_active: data.is_active,
        created_at: data.created_at,
      } as WhatsAppConfig;
    },
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["whatsapp-messages", messageFilter, dateRange],
    queryFn: async () => {
      let query = supabase
        .from("whatsapp_message_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (messageFilter !== "all") {
        query = query.eq("status", messageFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((m) => ({
        id: m.id,
        to: m.recipient_number,
        from: "",
        type: m.message_type as WhatsAppMessage["type"],
        content: m.message_content || "",
        status: m.status as WhatsAppMessage["status"],
        created_at: m.created_at,
        error_message: m.error_message || undefined,
      })) as WhatsAppMessage[];
    },
  });

  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_templates").select("*").order("name");
      if (error) throw error;
      return data as WhatsAppTemplate[];
    },
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (config?.id) {
        const { error } = await supabase.from("whatsapp_config").update(data).eq("id", config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("whatsapp_config").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-config"] });
      toast({ title: "Configuração salva com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar configuração",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendTestMutation = useMutation({
    mutationFn: async ({
      to,
      message,
      template,
    }: {
      to: string;
      message?: string;
      template?: string;
    }) => {
      const { error } = await supabase.functions.invoke("send-whatsapp", {
        body: {
          to,
          message,
          template_name: template,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Mensagem de teste enviada!" });
      setTestNumber("");
      setTestMessage("");
      setSelectedTemplate("");
      queryClient.invalidateQueries({ queryKey: ["whatsapp-messages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncTemplatesMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("sync-whatsapp-templates");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast({ title: "Templates sincronizados!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao sincronizar templates",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stats = useMemo(
    () => ({
      totalMessages: messages.length,
      sent: messages.filter((m) => m.status === "sent").length,
      delivered: messages.filter((m) => m.status === "delivered").length,
      read: messages.filter((m) => m.status === "read").length,
      failed: messages.filter((m) => m.status === "failed").length,
      templates: templates.length,
      approvedTemplates: templates.filter((t) => t.status === "approved").length,
    }),
    [messages, templates]
  );

  const handleSaveConfig = useCallback(() => {
    saveConfigMutation.mutate(configData);
  }, [configData, saveConfigMutation]);

  const handleSendTest = useCallback(() => {
    if (!testNumber) {
      toast({ title: "Informe o número de telefone", variant: "destructive" });
      return;
    }
    sendTestMutation.mutate({
      to: testNumber,
      message: testMessage || undefined,
      template: selectedTemplate || undefined,
    });
  }, [testNumber, testMessage, selectedTemplate, sendTestMutation, toast]);

  const handleSyncTemplates = useCallback(() => {
    syncTemplatesMutation.mutate();
  }, [syncTemplatesMutation]);

  const [prevConfig, setPrevConfig] = useState(config);
  if (config !== prevConfig) {
    setPrevConfig(config);
    if (config) {
      setConfigData({
        provider: config.provider,
        phone_number_id: config.phone_number_id,
        business_account_id: config.business_account_id,
        access_token: config.access_token,
        webhook_verify_token: config.webhook_verify_token,
        evolution_api_url: config.evolution_api_url,
        evolution_instance_token: config.evolution_instance_token,
        evolution_instance_name: config.evolution_instance_name,
        is_active: config.is_active,
      });
    }
  }

  return {
    activeTab,
    setActiveTab,
    configData,
    setConfigData,
    testNumber,
    setTestNumber,
    testMessage,
    setTestMessage,
    selectedTemplate,
    setSelectedTemplate,
    messageFilter,
    setMessageFilter,
    dateRange,
    setDateRange,
    config,
    messages,
    templates,
    stats,
    isLoadingConfig,
    isLoadingMessages,
    isLoadingTemplates,
    isSavingConfig: saveConfigMutation.isPending,
    isSendingTest: sendTestMutation.isPending,
    isSyncingTemplates: syncTemplatesMutation.isPending,
    handleSaveConfig,
    handleSendTest,
    handleSyncTemplates,
  };
}
