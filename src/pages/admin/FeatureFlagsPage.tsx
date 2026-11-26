import {
  AlertTriangle,
  Flag,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
  DESCRIPTION_MAX_LENGTH,
  NAME_PATTERN,
  normalizeFlagName,
  useFeatureFlagsPage,
} from "@/hooks/useFeatureFlagsPage";

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return format(parsed, "dd/MM/yyyy HH:mm");
}

export default function FeatureFlagsPage() {
  const page = useFeatureFlagsPage();
  const normalizedName = normalizeFlagName(page.formData.name);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Flags"
        description="Ligue e desligue recursos por empresa sem deploy. Cada flag é lida pelo nome (snake_case) direto do banco."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={page.refetch} disabled={page.isLoading}>
              <RefreshCw
                className={page.isLoading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"}
              />
              Atualizar
            </Button>
            <Button onClick={page.openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova flag
            </Button>
          </div>
        }
      />

      <Alert>
        <Flag className="h-4 w-4" />
        <AlertTitle>Liberação gradual sem deploy</AlertTitle>
        <AlertDescription>
          Toda a empresa vê as flags (leitura), mas só administradores alteram. Uma flag nova nasce
          desligada: ativar aqui é o que libera o recurso para a empresa.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Flags cadastradas</CardDescription>
            <CardTitle className="text-2xl">{page.summary.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            {page.summary.enabled} ativas · {page.summary.disabled} desligadas
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recursos liberados</CardDescription>
            <CardTitle className="text-2xl">{page.summary.enabled}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Visíveis para os usuários da empresa
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Com condições</CardDescription>
            <CardTitle className="text-2xl">
              {page.flags.filter((flag) => flag.conditions !== null).length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Regras extras gravadas em JSON
          </CardContent>
        </Card>
      </div>

      {page.isError ? (
        <div className="py-12">
          <EmptyState
            icon={AlertTriangle}
            title="Não foi possível carregar as flags"
            description={
              page.error instanceof Error
                ? page.error.message
                : "Verifique a conexão com o banco e tente novamente."
            }
            primaryAction={{ label: "Tentar novamente", onClick: page.refetch, icon: RefreshCw }}
          />
        </div>
      ) : page.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Flags da empresa</CardTitle>
              <CardDescription>
                {page.visibleFlags.length} de {page.flags.length} flags
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                className="w-[260px] pl-9"
                placeholder="Buscar por nome ou descrição"
                value={page.term}
                onChange={(event) => page.setTerm(event.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {page.visibleFlags.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Flag}
                  title={page.term ? "Nenhuma flag com essa busca" : "Nenhuma flag cadastrada"}
                  description={
                    page.term
                      ? "Ajuste a busca para encontrar a flag."
                      : "Cadastre a primeira flag para liberar um recurso sem deploy."
                  }
                  primaryAction={
                    page.term
                      ? { label: "Limpar busca", onClick: () => page.setTerm("") }
                      : { label: "Nova flag", onClick: page.openCreate, icon: Plus }
                  }
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flag</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Condições</TableHead>
                    <TableHead>Atualizada em</TableHead>
                    <TableHead>Ativa</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {page.visibleFlags.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell className="font-mono text-xs">{flag.name}</TableCell>
                      <TableCell className="max-w-[320px] truncate text-sm">
                        {flag.description || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {flag.conditions ? (
                          <Badge variant="outline">com condições</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(flag.updated_at)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => page.toggleFlag(flag)}
                          aria-label={`Alternar ${flag.name}`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => page.openEdit(flag)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar flag</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => page.setRemoving(flag)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remover flag</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={page.dialogOpen} onOpenChange={page.handleDialogOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{page.editing ? "Editar flag" : "Nova flag"}</DialogTitle>
            <DialogDescription>
              O nome é a chave consultada pelo app. Depois de criada, evite renomear: o código que
              já usa o nome antigo deixa de encontrar a flag.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flag-name">Nome</Label>
              <Input
                id="flag-name"
                className="font-mono"
                placeholder="novo_dashboard"
                value={page.formData.name}
                onChange={(event) =>
                  page.setFormData({ ...page.formData, name: event.target.value })
                }
              />
              {page.showErrors && page.errors.name ? (
                <p className="text-destructive text-xs">{page.errors.name}</p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Gravado como <span className="font-mono">{normalizedName || "—"}</span>
                  {normalizedName && !NAME_PATTERN.test(normalizedName)
                    ? " · formato inválido"
                    : ""}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="flag-description">Descrição</Label>
              <Textarea
                id="flag-description"
                rows={3}
                placeholder="O que essa flag libera e para quem"
                value={page.formData.description}
                onChange={(event) =>
                  page.setFormData({ ...page.formData, description: event.target.value })
                }
              />
              {page.showErrors && page.errors.description ? (
                <p className="text-destructive text-xs">{page.errors.description}</p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {page.formData.description.length}/{DESCRIPTION_MAX_LENGTH}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="flag-conditions">Condições (JSON, opcional)</Label>
              <Textarea
                id="flag-conditions"
                rows={4}
                className="font-mono text-xs"
                placeholder={'{"plano": "enterprise"}'}
                value={page.formData.conditions}
                onChange={(event) =>
                  page.setFormData({ ...page.formData, conditions: event.target.value })
                }
              />
              {page.showErrors && page.errors.conditions ? (
                <p className="text-destructive text-xs">{page.errors.conditions}</p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Deixe vazio para liberar a flag sem restrição adicional.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => page.handleDialogOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={page.handleSubmit} disabled={page.isSaving}>
              {page.isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {page.editing ? "Salvar" : "Criar flag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={page.removing !== null}
        onOpenChange={(open) => {
          if (!open) page.setRemoving(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover flag?</AlertDialogTitle>
            <AlertDialogDescription>
              A flag <span className="font-mono">{page.removing?.name ?? ""}</span> deixa de
              existir. Recursos que consultam esse nome passam a ficar desligados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={page.handleRemove}
              disabled={page.isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
