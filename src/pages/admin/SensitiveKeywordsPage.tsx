import { AlertCircle, Loader2, Pencil, Plus, Search, ShieldAlert, Trash2 } from "lucide-react";
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
import { useSensitiveKeywordsPage } from "@/hooks/useSensitiveKeywordsPage";

export default function SensitiveKeywordsPage() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isDialogOpen,
    setIsDialogOpen,
    deletingKeyword,
    setDeletingKeyword,
    editingKeyword,
    formData,
    setFormData,
    keywords,
    totalKeywords,
    stats,
    isLoading,
    isError,
    refetch,
    isSaving,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseDialog,
    handleSubmit,
    handleToggleActive,
    handleDelete,
  } = useSensitiveKeywordsPage();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Palavras Sensiveis"
        description="Termos que o monitoramento procura no texto capturado das telas. Uma deteccao gera alerta de vazamento."
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova palavra
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cadastradas</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ativas no scan</CardDescription>
            <CardTitle className="text-2xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Desativadas</CardDescription>
            <CardTitle className="text-2xl">{stats.inactive}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Lista de termos
          </CardTitle>
          <CardDescription>
            A comparacao ignora maiusculas e minusculas. Termos repetidos sao bloqueados pelo banco.
          </CardDescription>
          <div className="flex flex-col gap-2 pt-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar palavra-chave"
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
            >
              <SelectTrigger className="sm:w-52">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Somente ativas</SelectItem>
                <SelectItem value="inactive">Somente desativadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="text-destructive h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                Nao foi possivel carregar as palavras.
              </p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : keywords.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title={totalKeywords === 0 ? "Nenhuma palavra cadastrada" : "Nada encontrado"}
              description={
                totalKeywords === 0
                  ? "Sem termos cadastrados o scan de tela nao detecta vazamento. Adicione o primeiro."
                  : "Ajuste a busca ou o filtro de status."
              }
              primaryAction={
                totalKeywords === 0
                  ? { label: "Adicionar palavra", onClick: handleOpenCreate, icon: Plus }
                  : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Palavra-chave</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Criada em</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.keyword}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={() => handleToggleActive(item)}
                          aria-label={`Ativar ${item.keyword}`}
                        />
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Ativa" : "Desativada"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingKeyword(item)}>
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => (open ? setIsDialogOpen(true) : handleCloseDialog())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingKeyword ? "Editar palavra-chave" : "Nova palavra-chave"}
            </DialogTitle>
            <DialogDescription>
              O termo entra no scan do monitoramento assim que estiver ativo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">Palavra-chave</Label>
              <Input
                id="keyword"
                value={formData.keyword}
                onChange={(event) => setFormData({ ...formData, keyword: event.target.value })}
                placeholder="Ex.: proposta comercial"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Ativa</p>
                <p className="text-muted-foreground text-xs">
                  Desative para manter o termo sem usar no scan.
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingKeyword ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingKeyword}
        onOpenChange={(open) => !open && setDeletingKeyword(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover palavra-chave?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingKeyword?.keyword}&quot; deixa de ser detectada nas proximas capturas.
              Nao da para desfazer.
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
