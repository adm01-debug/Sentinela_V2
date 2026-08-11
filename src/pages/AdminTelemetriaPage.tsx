import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, RefreshCw, Trash2, Download, FileText, CalendarIcon } from "lucide-react";
import { TelemetryCharts } from "@/components/admin/telemetry/TelemetryCharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logger } from '@/lib/logger';
import { TelemetryStatsCards, TopOffendersCard } from "./admin/TelemetryComponents";
import { TelemetryTable } from "./admin/TelemetryTable";

interface TelemetryRow {
  id: string;
  operation: string;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number;
  record_count: number | null;
  query_limit: number | null;
  query_offset: number | null;
  count_mode: string | null;
  severity: string;
  error_message: string | null;
  user_id: string | null;
  created_at: string;
}

type SeverityFilter = "all" | "slow" | "very_slow" | "error";
type TimeFilter = "1h" | "6h" | "24h" | "7d" | "custom";

const formatDuration = (ms: number) => ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
const formatTime = (iso: string) => new Date(iso).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit" });

export default function AdminTelemetriaPage() {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("24h");
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>();
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>();

  const getTimeThreshold = (): { from: string; to: string } => {
    const now = new Date();
    const to = now.toISOString();
    if (timeFilter === "custom" && customDateFrom) {
      const fromDate = new Date(customDateFrom); fromDate.setHours(0, 0, 0, 0);
      const toDate = customDateTo ? new Date(customDateTo) : new Date(); toDate.setHours(23, 59, 59, 999);
      return { from: fromDate.toISOString(), to: toDate.toISOString() };
    }
    const hours: Record<string, number> = { "1h": 1, "6h": 6, "24h": 24, "7d": 168 };
    const h = hours[timeFilter] || 24;
    return { from: new Date(now.getTime() - h * 60 * 60 * 1000).toISOString(), to };
  };

  const { data: rows = [], isLoading, refetch, isRefetching } = useQuery<TelemetryRow[]>({
    queryKey: ["query-telemetry", severityFilter, timeFilter, customDateFrom?.toISOString(), customDateTo?.toISOString()],
    queryFn: async () => {
      const { from, to } = getTimeThreshold();
      let query = supabase.from("query_telemetry").select("*").gte("created_at", from).lte("created_at", to).order("created_at", { ascending: false }).limit(500);
      if (severityFilter !== "all") query = query.eq("severity", severityFilter);
      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as TelemetryRow[]) || [];
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const handleCleanup = async () => {
    const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from("query_telemetry").delete().lt("created_at", threshold);
    if (error) toast.error("Erro ao limpar dados antigos");
    else { toast.success("Dados com mais de 7 dias removidos"); refetch(); }
  };

  const handleExportCSV = () => {
    if (rows.length === 0) { toast.error("Nenhum dado para exportar"); return; }
    const headers = ["Data/Hora", "Operação", "Tabela/RPC", "Duração (ms)", "Severidade", "Registros", "Limit", "Offset", "Count Mode", "Erro"];
    const csvRows = rows.map(r => [new Date(r.created_at).toLocaleString("pt-BR"), r.operation, r.table_name || r.rpc_name || "-", r.duration_ms, r.severity, r.record_count ?? "-", r.query_limit ?? "-", r.query_offset ?? "-", r.count_mode ?? "-", (r.error_message || "").replace(/"/g, '""')]);
    const csvContent = [headers.join(";"), ...csvRows.map(row => row.map(v => `"${v}"`).join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `telemetria_${format(new Date(), "yyyy-MM-dd")}_${timeFilter}.csv`; link.click();
    URL.revokeObjectURL(url);
    toast.success(`CSV exportado com ${rows.length} registros`);
  };

  const handleExportPDF = async () => {
    if (rows.length === 0) { toast.error("Nenhum dado para exportar"); return; }
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      doc.setFontSize(16); doc.text("Telemetria de Queries", 14, 15);
      doc.setFontSize(9); doc.setTextColor(100);
      const periodLabels: Record<string, string> = { "1h": "Última hora", "6h": "Últimas 6h", "24h": "Últimas 24h", "7d": "Últimos 7 dias", "custom": "Período personalizado" };
      doc.text(`Exportado em ${new Date().toLocaleString("pt-BR")} · Período: ${periodLabels[timeFilter]} · ${rows.length} registros`, 14, 22);
      doc.setFontSize(10); doc.setTextColor(0);
      doc.text(`Muito Lentas: ${verySlow} | Lentas: ${slow} | Erros: ${errors} | Média: ${formatDuration(avgDuration)}`, 14, 30);
      const headers = ["Data/Hora", "Operação", "Tabela/RPC", "Duração", "Severidade", "Records", "Limit", "Erro"];
      const body = rows.map(r => [new Date(r.created_at).toLocaleString("pt-BR"), r.operation, r.rpc_name || r.table_name || "-", formatDuration(r.duration_ms), r.severity === "very_slow" ? "Muito Lenta" : r.severity === "slow" ? "Lenta" : r.severity === "error" ? "Erro" : r.severity, r.record_count?.toString() ?? "-", r.query_limit?.toString() ?? "-", (r.error_message || "-").substring(0, 40)]);
      autoTable(doc, { head: [headers], body, startY: 35, styles: { fontSize: 7, cellPadding: 1.5 }, headStyles: { fillColor: [41, 37, 36], textColor: 255 }, alternateRowStyles: { fillColor: [245, 245, 244] }, columnStyles: { 3: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" } } });
      doc.save(`telemetria_${format(new Date(), "yyyy-MM-dd")}_${timeFilter}.pdf`);
      toast.success("PDF exportado com sucesso");
    } catch (err) { logger.error("PDF export error:", err); toast.error("Erro ao exportar PDF"); }
  };

  const verySlow = rows.filter(r => r.severity === "very_slow").length;
  const slow = rows.filter(r => r.severity === "slow").length;
  const errors = rows.filter(r => r.severity === "error").length;
  const avgDuration = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.duration_ms, 0) / rows.length) : 0;

  const tableStats = new Map<string, { count: number; totalMs: number; maxMs: number }>();
  for (const r of rows) {
    const key = r.rpc_name || r.table_name || "unknown";
    const prev = tableStats.get(key) || { count: 0, totalMs: 0, maxMs: 0 };
    tableStats.set(key, { count: prev.count + 1, totalMs: prev.totalMs + r.duration_ms, maxMs: Math.max(prev.maxMs, r.duration_ms) });
  }
  const topOffenders = [...tableStats.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8)
    .map(([name, stats]) => ({ name, count: stats.count, maxMs: stats.maxMs, avgMs: Math.round(stats.totalMs / stats.count) }));

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Telemetria de Queries</h1>
            <p className="text-sm text-muted-foreground">Monitoramento de performance do banco externo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="h-3.5 w-3.5 mr-1.5" />CSV</Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}><FileText className="h-3.5 w-3.5 mr-1.5" />PDF</Button>
          <Button variant="outline" size="sm" onClick={handleCleanup}><Trash2 className="h-3.5 w-3.5 mr-1.5" />Limpar +7d</Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}><RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefetching ? "animate-spin" : ""}`} />Atualizar</Button>
        </div>
      </div>

      <TelemetryStatsCards verySlow={verySlow} slow={slow} errors={errors} avgDuration={formatDuration(avgDuration)} />
      <TopOffendersCard offenders={topOffenders} formatDuration={formatDuration} />
      <TelemetryCharts rows={rows} timeFilter={timeFilter} />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as SeverityFilter)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Severidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="slow">🟡 Lentas</SelectItem>
            <SelectItem value="very_slow">🔴 Muito Lentas</SelectItem>
            <SelectItem value="error">❌ Erros</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Período" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Última hora</SelectItem>
            <SelectItem value="6h">Últimas 6h</SelectItem>
            <SelectItem value="24h">Últimas 24h</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="custom">📅 Personalizado</SelectItem>
          </SelectContent>
        </Select>
        {timeFilter === "custom" && (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("w-36 justify-start text-left font-normal", !customDateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />{customDateFrom ? format(customDateFrom, "dd/MM/yyyy") : "De"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={customDateFrom} onSelect={setCustomDateFrom} disabled={(date) => date > new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("w-36 justify-start text-left font-normal", !customDateTo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />{customDateTo ? format(customDateTo, "dd/MM/yyyy") : "Até"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={customDateTo} onSelect={setCustomDateTo} disabled={(date) => date > new Date() || (customDateFrom ? date < customDateFrom : false)} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{rows.length} registros · auto-refresh 30s</span>
      </div>

      <TelemetryTable rows={rows} isLoading={isLoading} formatDuration={formatDuration} formatTime={formatTime} />
    </div>
  );
}
