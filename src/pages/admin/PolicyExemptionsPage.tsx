import {
  AlertCircle,
  CalendarPlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/EmptyStates";
import {
  EXEMPTION_STATE_LABEL,
  exemptionKeyFor,
  exemptionState,
  findEmployeeForKey,
  usePolicyExemptionsPage,
} from "@/hooks/usePolicyExemptionsPage";

function formatDate(value: string | null): string {
  if (!value) return "Sem prazo";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem prazo";
  return format(date, "dd/MM/yyyy");
}

export default function PolicyExemptionsPage() {
  const {
    searchTerm,
    setSearchTerm,
    stateFilter,
    setStateFilter,
    isDialogOpen,
    setIsDialogOpen,
    editingExemption,
    deletingExemption,
    setDeletingExemption,
    formData,
    setFormData,
    exemptions,
    allExemptions,
    employees,
    summary,
    isLoading,
    isError,
    refetch,
    isSaving,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    handleExtend,
  } = usePolicyExemptionsPage();

  const selectedEmployee = findEmployeeForKey(employees, formData.employeeKey);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Isenções de Aceite"
        description="Funcionários isentos do aceite diário de políticas de monitoramento. O acesso deles é liberado direto pelo policy gate enquanto a isenção estiver vigente."
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova isenção
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vigentes</CardDescription>
            <CardTitle className="text-2xl">{summary.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expiradas</CardDescription>
            <CardTitle className="text-2xl">{summary.expired}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sem prazo</CardDescription>
            <CardTitle className="text-2xl">{summary.withoutDeadline}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Registradas</CardDescription>
            <CardTitle className="text-2xl">{summary.total}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Lista de isenções
          </CardTitle>
          <CardDescription>
            A isenção vale enquanto não passar a data de validade. Expirada, o funcionário volta a
            confirmar as políticas todos os dias.
          </CardDescription>
          <div className="flex flex-col gap-2 pt-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por funcionário ou motivo"
                className="pl-9"
                aria-label="Buscar isenções"
              />
            </div>
            <Select
              value={stateFilter}
              onValueChange={(value) => setStateFilter(value as typeof stateFilter)}
            >
              <SelectTrigger className="sm:w-48" aria-label="Filtrar por situação">
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Vigentes</SelectItem>
                <SelectItem value="expired">Expiradas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <EmptyState
              icon={AlertCircle}
              title="Não foi possível carregar as isenções"
              description="A leitura exige papel de admin. Tente novamente ou verifique suas permissões."
              primaryAction={{ label: "Tentar de novo", onClick: () => void refetch() }}
            />
          ) : isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-12 w-full" />
              ))}
            </div>
          ) : exemptions.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title={
                allExemptions.length === 0
                  ? "Nenhuma isenção registrada"
                  : "Nenhuma isenção para os filtros"
              }
              description={
                allExemptions.length === 0
                  ? "Todos os funcionários seguem confirmando as políticas diariamente. Registre uma isenção para liberar alguém desse aceite."
                  : "Ajuste a busca ou a situação para encontrar a isenção."
              }
              primaryAction={
                allExemptions.length === 0
                  ? { label: "Nova isenção", onClick: handleOpenCreate, icon: Plus }
                  : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Registrada em</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exemptions.map((exemption) => {
                    const state = exemptionState(exemption.expires_at);
                    const employee = findEmployeeForKey(employees, exemption.employee_name);
                    return (
                      <TableRow key={exemption.id}>
                        <TableCell>
                          <div className="font-medium">
                            {employee?.name ?? exemption.employee_name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {employee
                              ? `chave: ${exemption.employee_name}`
                              : "sem cadastro de funcionário para esta chave"}
                            {employee?.department ? ` · ${employee.department}` : ""}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs text-sm">
                          {exemption.reason || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(exemption.created_at)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(exemption.expires_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={state === "active" ? "default" : "secondary"}>
                            {EXEMPTION_STATE_LABEL[state]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExtend(exemption, 30)}
                              disabled={isSaving}
                              title="Estender por 30 dias"
                            >
                              <CalendarPlus className="h-4 w-4" />
                              <span className="sr-only">Estender 30 dias</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(exemption)}
                              aria-label="Editar isenção"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingExemption(exemption)}
                              aria-label="Remover isenção"
                            >
                              <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExemption ? "Editar isenção" : "Nova isenção"}</DialogTitle>
            <DialogDescription>
              {editingExemption
                ? "Altere o motivo ou a validade. Para trocar o funcionário, remova esta isenção e crie outra."
                : "O funcionário escolhido deixa de confirmar as políticas diariamente enquanto a isenção estiver vigente."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {editingExemption ? (
              <div className="space-y-1.5">
                <Label>Funcionário</Label>
                <div className="rounded-md border px-3 py-2 text-sm">
                  {editingExemption.employee_name}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="exemption-employee">Funcionário</Label>
                <Select
                  value={formData.employeeKey}
                  onValueChange={(value) =>
                    setFormData((previous) => ({ ...previous, employeeKey: value }))
                  }
                >
                  <SelectTrigger id="exemption-employee">
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={exemptionKeyFor(employee)}>
                        {employee.name}
                        {employee.email ? ` · ${employee.email}` : " · sem e-mail"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEmployee && !selectedEmployee.email ? (
                  <p className="text-muted-foreground text-xs">
                    Sem e-mail cadastrado: a isenção fica vinculada ao nome e só vale se o nome do
                    login for exatamente esse.
                  </p>
                ) : null}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="exemption-reason">Motivo</Label>
              <Textarea
                id="exemption-reason"
                value={formData.reason}
                onChange={(event) =>
                  setFormData((previous) => ({ ...previous, reason: event.target.value }))
                }
                placeholder="Ex.: auditoria externa, cargo sem captura de tela"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exemption-expires">Vale até</Label>
              <Input
                id="exemption-expires"
                type="date"
                value={formData.expiresAt}
                onChange={(event) =>
                  setFormData((previous) => ({ ...previous, expiresAt: event.target.value }))
                }
              />
              <p className="text-muted-foreground text-xs">
                Deixe em branco para isenção sem prazo.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingExemption ? "Salvar" : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deletingExemption !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingExemption(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover isenção?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingExemption
                ? `${deletingExemption.employee_name} volta a confirmar as políticas de monitoramento todos os dias.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
