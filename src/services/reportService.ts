import { supabase } from '@/integrations/supabase/client';

export const reportService = {
  async getReports() {
    const { data, error } = await supabase
      .from('ai_analysis_reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [], total: data?.length || 0 };
  },

  async getReportById(id: string) {
    const { data, error } = await supabase
      .from('ai_analysis_reports')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async deleteReport(id: string) {
    const { error } = await supabase
      .from('ai_analysis_reports')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async generateReport(params: { type?: string; summary?: string }) {
    const { data, error } = await supabase
      .from('ai_analysis_reports')
      .insert({
        report_type: params.type || 'general',
        summary: params.summary || 'Report generated',
      })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }
};

export default reportService;
