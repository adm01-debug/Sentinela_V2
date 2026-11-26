import { useState } from "react";
import { Download, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReportsPage } from "@/hooks/useReportsPage";
import { useAuth } from "@/providers/AuthProvider";

const REPORT_TYPES = [
  { value: "summary", label: "Resumo geral" },
  { value: "productivity", label: "Produtividade" },
  { value: "violations", label: "Violações" },
  { value: "attendance", label: "Presença" },
] as const;

const TIPO_LABEL: Record<string, string> = Object.fromEntries(
  REPORT_TYPES.map((t) => [t.value, t.label])
);

const STATUS_LABEL: Record<string, string> = {
  pending: "Na fila",
  generating: "Gerando",
  completed: "Concluído",
  failed: "Falhou",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  generating: "secondary",
  completed: "default",
  failed: "destructive",
};

function formatarData(valor: string) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "-" : data.toLocaleString("pt-BR");
}

/**
 * Execuções do gerador real (`reports` + edge `generate-report`).
 * Diferente da lista de análises (`ai_analysis_reports`) exibida acima, aqui
 * aparece o estado de cada geração: na fila, gerando, concluído ou falhou.
 */
export function ReportRunsPanel() {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.isAdmin);
  const {
    reports,
    stats,
    typeFilter,
    isGenerateOpen,
    selectedType,
    isLoading,
    isGenerating,
    setTypeFilter,
    setIsGenerateOpen,
    setSelectedType,
    handleGenerate,
    handleDelete,
    handleDownload,
  } = useReportsPage();
  const [confirmarExclusao, setConfirmarExclusao] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Execuções do gerador</CardTitle>
          <CardDescription>
            Cada disparo cria um registro em <code>reports</code> e roda a função{" "}
            <code>generate-report</code>, que calcula os dados do período e anexa o arquivo.
          </CardDescription>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-[170px]" aria-label="Filtrar por tipo">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {REPORT_TYPES.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="h-9 gap-2" onClick={() => setIsGenerateOpen(true)}>
              <Plus className="h-4 w-4" />
              Gerar agora
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { rotulo: "Execuções", valor: stats.total },
            { rotulo: "Concluídas", valor: stats.completed },
            { rotulo: "Em andamento", valor: stats.pending },
            { rotulo: "Falhas", valor: stats.failed },
          ].map((item) => (
            <div key={item.rotulo} className="rounded-lg border p-3">
              <p className="text-2xl font-bold">{item.valor}</p>
              <p className="text-muted-foreground text-xs">{item.rotulo}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8" role="status" aria-live="polite">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            <span className="sr-only">Carregando execuções do gerador...</span>
          </div>
        ) : !reports.length ? (
          <div className="py-8 text-center">
            <FileText className="text-muted-foreground mx-auto mb-3 h-8 w-8 opacity-50" />
            <p className="font-medium">Nenhuma execução registrada</p>
            <p className="text-muted-foreground text-sm">
              {isAdmin
                ? 'Use "Gerar agora" para produzir o primeiro relatório.'
                : "Apenas administradores podem disparar o gerador."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {reports.map((relatorio) => {
              const status = relatorio.status ?? "pending";
              return (
                <li
                  key={relatorio.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {relatorio.name || TIPO_LABEL[relatorio.type] || relatorio.type}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {TIPO_LABEL[relatorio.type] ?? relatorio.type} -{" "}
                      {formatarData(relatorio.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[status] ?? "outline"}>
                      {STATUS_LABEL[status] ?? status}
                    </Badge>
                    {relatorio.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => handleDownload(relatorio.file_url as string)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Baixar
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-8 gap-1"
                        onClick={() => setConfirmarExclusao(relatorio.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Excluir {relatorio.name}</span>
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar relatório</DialogTitle>
            <DialogDescription>
              O relatório entra na fila e é processado em segundo plano; o arquivo aparece aqui
              quando ficar pronto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm font-medium">Tipo</p>
            <Select
              value={selectedType}
              onValueChange={(valor) => setSelectedType(valor as typeof selectedType)}
            >
              <SelectTrigger aria-label="Tipo do relatório">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
              Gerar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmarExclusao !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setConfirmarExclusao(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir execução do gerador?</AlertDialogTitle>
            <AlertDialogDescription>
              O registro e o arquivo gerado saem do histórico. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmarExclusao) handleDelete(confirmarExclusao);
                setConfirmarExclusao(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default ReportRunsPanel;
