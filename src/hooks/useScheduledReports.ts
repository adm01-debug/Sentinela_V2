import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ScheduledReportSettings {
  id: string;
  report_type: "daily" | "weekly";
  enabled: boolean;
  recipient_emails: string[];
  send_time: string;
  send_day_of_week: number | null;
  include_violations: boolean;
  include_productivity: boolean;
  include_activity_summary: boolean;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useScheduledReports() {
  const [settings, setSettings] = useState<ScheduledReportSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("scheduled_report_settings")
        .select("*")
        .order("report_type");

      if (error) throw error;
      setSettings((data as ScheduledReportSettings[]) || []);
    } catch (error: any) {
      console.error("Error fetching scheduled report settings:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const createOrUpdateSettings = async (
    reportType: "daily" | "weekly",
    data: Partial<ScheduledReportSettings>
  ) => {
    try {
      const existing = settings.find((s) => s.report_type === reportType);

      if (existing) {
        const { error } = await supabase
          .from("scheduled_report_settings")
          .update(data)
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("scheduled_report_settings")
          .insert({ ...data, report_type: reportType });

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });

      await fetchSettings();
    } catch (error: any) {
      console.error("Error saving scheduled report settings:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    }
  };

  const sendTestReport = async (reportType: "daily" | "weekly") => {
    try {
      const { data, error } = await supabase.functions.invoke("send-scheduled-report", {
        body: { report_type: reportType },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Relatório enviado",
          description: `Relatório ${reportType === "weekly" ? "semanal" : "diário"} enviado com sucesso`,
        });
      } else {
        toast({
          title: "Aviso",
          description: data.message || "Não foi possível enviar o relatório",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error sending test report:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar relatório de teste",
        variant: "destructive",
      });
    }
  };

  return {
    settings,
    loading,
    createOrUpdateSettings,
    sendTestReport,
    refetch: fetchSettings,
  };
}
