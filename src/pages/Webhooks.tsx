import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Webhook, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Spinner } from '@/components/LoadingState';
import { WebhooksList, WebhookFormDialog } from '@/components/webhooks';
import { useWebhooksPage } from '@/hooks/useWebhooksPage';

export default function Webhooks() {
  const navigate = useNavigate();
  const {
    filteredWebhooks,
    stats,
    loading,
    selectedWebhook,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    formData,
    setFormData,
    toggleEvent,
    testResult,
    isTesting,
    isFormDialogOpen,
    setIsFormDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isTestDialogOpen,
    setIsTestDialogOpen,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleTest,
    handleToggleActive,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    openTestDialog,
  } = useWebhooksPage();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-64">
          <Header />
          <main className="p-6 flex items-center justify-center min-h-[60vh]">
            <Spinner size="lg" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Webhook className="h-8 w-8" />
                  Webhooks
                </h1>
                <p className="text-muted-foreground">
                  Configure integrações com sistemas externos
                </p>
              </div>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Webhook
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Inativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar webhooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <WebhooksList
            webhooks={filteredWebhooks}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onTest={openTestDialog}
            onToggleActive={handleToggleActive}
          />

          {/* Form Dialog */}
          <WebhookFormDialog
            open={isFormDialogOpen}
            onOpenChange={setIsFormDialogOpen}
            formData={formData}
            setFormData={setFormData}
            onToggleEvent={toggleEvent}
            onSubmit={selectedWebhook ? handleUpdate : handleCreate}
            isEditing={!!selectedWebhook}
          />

          {/* Test Dialog */}
          <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Testar Webhook</DialogTitle>
                <DialogDescription>
                  Enviar requisição de teste para {selectedWebhook?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {isTesting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Testando...</span>
                  </div>
                ) : testResult ? (
                  <div className={`flex items-center gap-2 ${testResult.success ? 'text-green-500' : 'text-destructive'}`}>
                    {testResult.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    <span>{testResult.message}</span>
                  </div>
                ) : null}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={handleTest} disabled={isTesting}>
                  {isTesting ? 'Testando...' : 'Testar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Webhook</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir "{selectedWebhook?.name}"?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}
