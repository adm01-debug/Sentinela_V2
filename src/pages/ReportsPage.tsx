import { Loader2, Plus, FileText, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReports } from "@/hooks/useReports";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { XlsxExportButton } from "@/components/exports/XlsxExportButton";
import { ReportRunsPanel } from "@/components/reports/ReportRunsPanel";

interface ReportItem {
  id: string;
  name?: string;
  report_type?: string;
  status?: string;
  created_at?: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  processing: "Processando",
  completed: "Concluído",
  failed: "Falhou",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  processing: "secondary",
  completed: "default",
  failed: "destructive",
};

export const ReportsPage = () => {
  const navigate = useNavigate();
  const { data: reportsData, isLoading, isError, error } = useReports();

  const reports: ReportItem[] = Array.isArray(reportsData)
    ? reportsData
    : (reportsData as { data?: ReportItem[] })?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Gere e visualize relatórios detalhados de atividades e produtividade."
        showBackButton={false}
        actions={
          <div className="flex gap-2">
            <XlsxExportButton
              filename="relatorios"
              sheets={[
                {
                  name: "Relatórios",
                  rows: reports.map((r) => ({
                    Nome: r.name || r.report_type || "Sem título",
                    Tipo: r.report_type ?? "",
                    Status: STATUS_LABEL[r.status ?? "pending"] ?? r.status ?? "",
                    "Criado em": r.created_at ? new Date(r.created_at).toLocaleString("pt-BR") : "",
                  })),
                },
              ]}
              disabled={reports.length === 0}
            />
            <Button onClick={() => navigate("/reports/custom")} className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              Novo Relatório
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12" role="status" aria-live="polite">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          <span className="sr-only">Carregando relatórios…</span>
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="space-y-2 py-12 text-center">
            <AlertCircle className="text-destructive mx-auto h-10 w-10" />
            <p className="font-medium">Não foi possível carregar os relatórios</p>
            <p className="text-muted-foreground text-sm">
              {(error as Error)?.message || "Tente novamente em alguns instantes."}
            </p>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-12 text-center">
            <FileText className="text-muted-foreground mx-auto h-10 w-10 opacity-50" />
            <div>
              <p className="font-medium">Nenhum relatório ainda</p>
              <p className="text-muted-foreground text-sm">
                Crie seu primeiro relatório personalizado.
              </p>
            </div>
            <Button onClick={() => navigate("/reports/custom")} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Relatório
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => {
            const status = report.status || "pending";
            return (
              <Card
                key={report.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/reports/${report.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/reports/${report.id}`);
                  }
                }}
                className="focus-visible:ring-ring cursor-pointer transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
              >
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {report.name || report.report_type || "Relatório sem título"}
                    </p>
                    {report.created_at && (
                      <p className="text-muted-foreground text-xs">
                        {new Date(report.created_at).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[status] ?? "outline"}>
                    {STATUS_LABEL[status] ?? status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ReportRunsPanel />
    </div>
  );
};

export default ReportsPage;
