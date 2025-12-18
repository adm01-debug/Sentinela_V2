import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportData {
  period: string;
  totalViolations: number;
  criticalViolations: number;
  productivityAvg: number;
  activeEmployees: number;
  topViolators: Array<{ name: string; count: number }>;
  violationsByType: Array<{ type: string; count: number }>;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { report_type } = await req.json().catch(() => ({ report_type: "daily" }));

    // Fetch report settings
    const { data: settings } = await supabase
      .from("scheduled_report_settings")
      .select("*")
      .eq("report_type", report_type)
      .eq("enabled", true)
      .maybeSingle();

    if (!settings || settings.recipient_emails.length === 0) {
      console.log("No enabled report settings found or no recipients");
      return new Response(
        JSON.stringify({ success: false, message: "No enabled report settings or recipients" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (report_type === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setDate(now.getDate() - 1);
    }

    // Fetch violations
    const { data: violations } = await supabase
      .from("security_violations")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", now.toISOString());

    // Fetch productivity data
    const { data: productivity } = await supabase
      .from("productivity_logs")
      .select("*")
      .gte("recorded_date", startDate.toISOString().split("T")[0])
      .lte("recorded_date", now.toISOString().split("T")[0]);

    // Fetch active employees
    const { data: employees } = await supabase
      .from("employees")
      .select("name")
      .eq("status", "active");

    // Calculate report data
    const violationsList = violations || [];
    const productivityList = productivity || [];

    const criticalViolations = violationsList.filter(v => v.severity === "critical").length;
    
    // Calculate average productivity
    let productivityAvg = 0;
    if (productivityList.length > 0) {
      const totalProductive = productivityList.reduce((sum, p) => sum + (p.productive_time_seconds || 0), 0);
      const totalTime = productivityList.reduce((sum, p) => 
        sum + (p.productive_time_seconds || 0) + (p.unproductive_time_seconds || 0) + (p.neutral_time_seconds || 0), 0
      );
      productivityAvg = totalTime > 0 ? Math.round((totalProductive / totalTime) * 100) : 0;
    }

    // Top violators
    const violatorCounts: Record<string, number> = {};
    violationsList.forEach(v => {
      violatorCounts[v.employee_name] = (violatorCounts[v.employee_name] || 0) + 1;
    });
    const topViolators = Object.entries(violatorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Violations by type
    const typeCounts: Record<string, number> = {};
    violationsList.forEach(v => {
      typeCounts[v.violation_type] = (typeCounts[v.violation_type] || 0) + 1;
    });
    const violationsByType = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const reportData: ReportData = {
      period: report_type === "weekly" ? "Última Semana" : "Últimas 24 Horas",
      totalViolations: violationsList.length,
      criticalViolations,
      productivityAvg,
      activeEmployees: employees?.length || 0,
      topViolators,
      violationsByType,
    };

    // Generate HTML email
    const htmlContent = generateReportHtml(reportData, settings);

    // Send email to all recipients
    const emailPromises = settings.recipient_emails.map((email: string) =>
      resend.emails.send({
        from: "SecureWatch <noreply@resend.dev>",
        to: [email],
        subject: `SecureWatch - Relatório ${report_type === "weekly" ? "Semanal" : "Diário"} - ${new Date().toLocaleDateString("pt-BR")}`,
        html: htmlContent,
      })
    );

    await Promise.all(emailPromises);

    // Update last_sent_at
    await supabase
      .from("scheduled_report_settings")
      .update({ last_sent_at: new Date().toISOString() })
      .eq("id", settings.id);

    console.log(`Report sent to ${settings.recipient_emails.length} recipients`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Report sent to ${settings.recipient_emails.length} recipients`,
        data: reportData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending scheduled report:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateReportHtml(data: ReportData, settings: any): string {
  const violatorsRows = data.topViolators
    .map(v => `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${v.name}</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${v.count}</td></tr>`)
    .join("") || '<tr><td colspan="2" style="padding: 8px; text-align: center; color: #888;">Nenhuma violação no período</td></tr>';

  const typesRows = data.violationsByType
    .map(v => `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${v.type}</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${v.count}</td></tr>`)
    .join("") || '<tr><td colspan="2" style="padding: 8px; text-align: center; color: #888;">Nenhuma violação no período</td></tr>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">🛡️ SecureWatch</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Relatório ${data.period}</p>
      <p style="margin: 5px 0 0; opacity: 0.7; font-size: 14px;">${new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
    </div>

    <div style="padding: 30px;">
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #e74c3c;">${data.totalViolations}</div>
          <div style="color: #666; font-size: 14px;">Total Violações</div>
        </div>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #c0392b;">${data.criticalViolations}</div>
          <div style="color: #666; font-size: 14px;">Críticas</div>
        </div>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #27ae60;">${data.productivityAvg}%</div>
          <div style="color: #666; font-size: 14px;">Produtividade Média</div>
        </div>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #3498db;">${data.activeEmployees}</div>
          <div style="color: #666; font-size: 14px;">Funcionários Ativos</div>
        </div>
      </div>

      ${settings.include_violations ? `
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #eee;">
          🚨 Top 5 Funcionários com Mais Violações
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 10px; text-align: left;">Funcionário</th>
              <th style="padding: 10px; text-align: center;">Violações</th>
            </tr>
          </thead>
          <tbody>
            ${violatorsRows}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #eee;">
          📊 Violações por Tipo
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 10px; text-align: left;">Tipo</th>
              <th style="padding: 10px; text-align: center;">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            ${typesRows}
          </tbody>
        </table>
      </div>
      ` : ""}

    </div>

    <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 12px;">
      <p style="margin: 0;">Este relatório foi gerado automaticamente pelo SecureWatch.</p>
      <p style="margin: 5px 0 0;">Para alterar as configurações de relatórios, acesse o painel administrativo.</p>
    </div>
  </div>
</body>
</html>
  `;
}
