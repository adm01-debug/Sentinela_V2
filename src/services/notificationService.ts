import { supabase } from "@/integrations/supabase/client";

export const notificationService = {
  async getHeaderNotifications(limit = 8) {
    const { data, error } = await supabase
      .from("security_violations")
      .select("id, violation_type, severity, created_at, employee_name, description")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  subscribeToViolations(onInsert: () => void) {
    const channel = supabase
      .channel("header-notifications-rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "security_violations" },
        () => onInsert()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

export default notificationService;
