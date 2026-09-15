import { supabase } from "@/integrations/supabase/client";

export const violationService = {
  async getViolations(filters?: { severity?: string; status?: string; employeeName?: string }) {
    let q = supabase
      .from("security_violations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (filters?.severity) q = q.eq("severity", filters.severity);
    if (filters?.status) q = q.eq("status", filters.status);
    if (filters?.employeeName) q = q.eq("employee_name", filters.employeeName);

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async resolveViolation(id: string) {
    const { error } = await supabase
      .from("security_violations")
      .update({ status: "resolved" })
      .eq("id", id);
    if (error) throw error;
  },
};

export default violationService;
