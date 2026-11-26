import { useState } from "react";
import { AlertTriangle, CalendarClock, Clock, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyStates";
import {
  RETENTION_DATA_TYPES,
  RETENTION_DATA_TYPE_META,
  useRetentionPoliciesPage,
  type RetentionDataType,
  type RetentionPolicy,
  type RetentionSource,
} from "@/hooks/useRetentionPoliciesPage";

const SOURCE_LABEL: Record<RetentionSource, string> = {
  empresa: "Politica da empresa",
  global: "Politica global",
  padrao: "Padrao do sistema",
  "sem-padrao": "Sem politica",
};

const SOURCE_VARIANT: Record<RetentionSource, "default" | "secondary" | "outline" | "destructive"> =
  {
    empresa: "default",
    global: "secondary",
    padrao: "outline",
    "sem-padrao": "destructive",
  };

interface EditState {
  dataType: RetentionDataType;
  retentionDays: number;
  isActive: boolean;
}

export default function RetentionPoliciesPage() {
  const {
    policies,
    companyOptions,
    selectedCompanyId,
    setSelectedCompanyId,
    scopeCompanyId,
    effective,
    isLoading,
    isError,
    refetch,
    isSaving,
    isDeleting,
    savePolicy,
    deletePolicy,
    toggleActive,
    findPolicy,
  } = useRetentionPoliciesPage();

  const [edit, setEdit] = useState<EditState | null>(null);
  const [deleting, setDeleting] = useState<RetentionPolicy | null>(null);

  const scopeLabel =
    companyOptions.find((option) => option.id === selectedCompanyId)?.name ?? "Global";

  const applicable = RETENTION_DATA_TYPES.filter(
    (dataType) => RETENTION_DATA_TYPE_META[dataType].appliedBy !== null
  ).length;

  const openEdit = (dataType: RetentionDataType) => {
    const current = findPolicy(dataType);
    setEdit({
      dataType,
      retentionDays: current?.retention_days ?? 30,
      isActive: current?.is_active ?? true,
    });
  };

  const submitEdit = async () => {
    if (!edit) return;
    await savePolicy({
      companyId: scopeCompanyId,
      dataType: edit.dataType,
      retentionDays: edit.retentionDays,
      isActive: edit.isActive,
    });
    setEdit(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retencao de dados"
        description="Por quanto tempo o sistema guarda cada tipo de dado. Politica da empresa vence a global, que vence o padrao do codigo. Sem politica cadastrada, vale o padrao."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Politicas cadastradas</CardDescription>
            <CardTitle className="text-2xl">{policies.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tipos com expurgo automatico</CardDescription>
            <CardTitle className="text-2xl">
              {applicable}/{RETENTION_DATA_TYPES.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Escopo em exibicao</CardDescription>
            <CardTitle className="truncate text-lg">{scopeLabel}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4" />
              Retencao vigente
            </CardTitle>
            <CardDescription>
              O que o sistema aplica hoje para o escopo selecionado. Linha sem expurgo automatico
              guarda a politica para quando o job existir.
            </CardDescription>
          </div>
          <div className="w-full sm:w-72">
            <Label htmlFor="retention-scope" className="text-muted-foreground text-xs">
              Escopo
            </Label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger id="retention-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {companyOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground flex items-center justify-center py-10">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando politicas...
            </div>
          ) : isError ? (
            <EmptyState
              icon={AlertTriangle}
              title="Nao foi possivel carregar as politicas"
              description="Tente novamente; se persistir, verifique as permissoes de administrador."
              primaryAction={{ label: "Tentar novamente", onClick: () => void refetch() }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de dado</TableHead>
                    <TableHead>Vigente hoje</TableHead>
                    <TableHead className="hidden md:table-cell">Origem</TableHead>
                    <TableHead className="hidden lg:table-cell">Aplicada por</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {effective.map((row) => {
                    const meta = RETENTION_DATA_TYPE_META[row.dataType];
                    const own = findPolicy(row.dataType);
                    return (
                      <TableRow key={row.dataType}>
                        <TableCell>
                          <div className="font-medium">{meta.label}</div>
                          <div className="text-muted-foreground text-xs">{meta.description}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.days === null ? (
                            <span className="text-muted-foreground">sem retencao definida</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium">
                              <Clock className="h-3.5 w-3.5" />
                              {row.days} dias
                            </span>
                          )}
                          <div className="mt-1 md:hidden">
                            <Badge variant={SOURCE_VARIANT[row.source]}>
                              {SOURCE_LABEL[row.source]}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={SOURCE_VARIANT[row.source]}>
                            {SOURCE_LABEL[row.source]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                          {meta.appliedBy ?? "Ainda nao aplicada por job automatico"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {own && (
                              <Switch
                                checked={own.is_active}
                                aria-label={`Ativar politica de ${meta.label}`}
                                onCheckedChange={(checked) =>
                                  void toggleActive({ id: own.id, isActive: checked })
                                }
                              />
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(row.dataType)}
                            >
                              {own ? (
                                <>
                                  <Pencil className="mr-1 h-3.5 w-3.5" />
                                  Editar
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-1 h-3.5 w-3.5" />
                                  Definir
                                </>
                              )}
                            </Button>
                            {own && (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Remover politica de ${meta.label}`}
                                onClick={() => setDeleting(own)}
                              >
                                <Trash2 className="text-destructive h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={edit !== null} onOpenChange={(open) => !open && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {edit ? RETENTION_DATA_TYPE_META[edit.dataType].label : "Retencao"}
            </DialogTitle>
            <DialogDescription>
              Escopo: {scopeLabel}. Dias entre 1 e 3650; a alteracao vale no proximo ciclo do job.
            </DialogDescription>
          </DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="retention-days">Dias de retencao</Label>
                <Input
                  id="retention-days"
                  type="number"
                  min={1}
                  max={3650}
                  value={edit.retentionDays}
                  onChange={(event) =>
                    setEdit({ ...edit, retentionDays: Number(event.target.value) })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">Politica ativa</div>
                  <div className="text-muted-foreground text-xs">
                    Inativa nao e lida pelas edges; o escopo cai para a global ou o padrao.
                  </div>
                </div>
                <Switch
                  checked={edit.isActive}
                  onCheckedChange={(checked) => setEdit({ ...edit, isActive: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void submitEdit()}
              disabled={
                isSaving ||
                !edit ||
                !Number.isFinite(edit.retentionDays) ||
                edit.retentionDays < 1 ||
                edit.retentionDays > 3650
              }
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover politica de retencao?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `A politica de ${RETENTION_DATA_TYPE_META[deleting.data_type].label} sera apagada e o escopo volta a usar a global ou o padrao. Nenhum dado ja expurgado volta.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => {
                if (deleting) void deletePolicy(deleting.id);
                setDeleting(null);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
