import { useState } from "react";
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  subjectDataTableLabel,
  useDeleteSubjectData,
  useSubjectDataPreview,
} from "@/hooks/useDeleteSubjectData";

interface DeleteSubjectDataDialogProps {
  employeeId: string;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

/**
 * Exclusao dos dados do titular (LGPD - direito ao esquecimento).
 *
 * O dialogo mostra antes o que sera apagado (contagem por tabela vinda do
 * `dry_run` da edge `delete-user-data`) e exige digitar o nome do funcionario:
 * a exclusao e irreversivel.
 */
export function DeleteSubjectDataDialog({
  employeeId,
  employeeName,
  open,
  onOpenChange,
  onDeleted,
}: DeleteSubjectDataDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const { toast } = useToast();
  const preview = useSubjectDataPreview(employeeId, open);
  const deletion = useDeleteSubjectData(employeeId);

  const handleOpenChange = (next: boolean) => {
    if (!next) setConfirmation("");
    onOpenChange(next);
  };

  const matches =
    confirmation.trim().toLowerCase() === employeeName.trim().toLowerCase() &&
    employeeName.trim() !== "";
  const counted = (preview.data?.counts ?? []).filter((row) => (row.rows ?? 0) > 0);
  const previewError = preview.error instanceof Error ? preview.error.message : null;

  const handleDelete = async () => {
    try {
      const result = await deletion.mutateAsync(confirmation);
      toast({
        title: "Dados do titular excluidos",
        description: `${result.tablesProcessed} tabelas limpas. ${
          result.audit_logged ? "Registro gravado na trilha de auditoria." : ""
        }`.trim(),
      });
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast({
        title: "Nao foi possivel excluir os dados",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="text-destructive h-5 w-5" />
            Excluir dados do titular (LGPD)
          </AlertDialogTitle>
          <AlertDialogDescription>
            Apaga permanentemente a telemetria e o cadastro de <strong>{employeeName}</strong>. A
            acao e irreversivel e fica registrada na trilha de auditoria.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg border p-3">
            <div className="mb-2 text-sm font-medium">O que sera apagado</div>
            {preview.isLoading && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Contando registros...
              </div>
            )}
            {previewError && (
              <div className="text-destructive flex items-start gap-2 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Nao foi possivel contar os registros: {previewError}</span>
              </div>
            )}
            {preview.data && counted.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Nenhum registro encontrado nas tabelas de telemetria.
              </p>
            )}
            {preview.data && counted.length > 0 && (
              <>
                <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                  {counted.map((row) => (
                    <li key={row.table} className="flex items-center justify-between gap-3">
                      <span>{subjectDataTableLabel(row.table)}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {row.rows ?? 0} registro(s)
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm font-medium">
                  <span>Total</span>
                  <span className="tabular-nums">{preview.data.total_rows} registro(s)</span>
                </div>
              </>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-employee-name">
              Digite <span className="font-semibold">{employeeName}</span> para confirmar
            </Label>
            <Input
              id="confirm-employee-name"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={employeeName}
              autoComplete="off"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletion.isPending}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!matches || deletion.isPending}
          >
            {deletion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir dados
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
