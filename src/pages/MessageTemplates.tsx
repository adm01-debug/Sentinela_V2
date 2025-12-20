import { useMessageTemplatesPage } from '@/hooks/useMessageTemplatesPage';
import { TemplateStatsCards, TemplateFilters, TemplatesList } from '@/components/templates';
import { PageHeader } from '@/components/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Loader2 } from 'lucide-react';

export default function MessageTemplates() {
  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    isDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingTemplate,
    deletingTemplate,
    formData,
    setFormData,
    previewMode,
    setPreviewMode,
    templates,
    stats,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
    handleInsertVariable,
    getPreviewContent,
    TEMPLATE_CATEGORIES,
    TEMPLATE_VARIABLES,
  } = useMessageTemplatesPage();

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Templates de Mensagem"
        description="Gerencie templates de mensagens para notificações e alertas"
      />

      <TemplateStatsCards stats={stats} isLoading={isLoading} />

      <TemplateFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onCreateClick={handleOpenCreate}
        categories={TEMPLATE_CATEGORIES}
      />

      <TemplatesList
        templates={templates}
        categories={TEMPLATE_CATEGORIES}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? 'Atualize as informações do template'
                : 'Crie um novo template de mensagem'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={previewMode ? 'preview' : 'edit'} onValueChange={(v) => setPreviewMode(v === 'preview')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Editar</TabsTrigger>
              <TabsTrigger value="preview">Visualizar</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Alerta de Violação"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Digite o conteúdo do template..."
                    rows={6}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Variáveis Disponíveis</Label>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATE_VARIABLES.map((v) => (
                      <Badge
                        key={v.key}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleInsertVariable(v.key)}
                      >
                        {v.key}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Template ativo</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="font-medium mb-2">{formData.name || 'Sem título'}</h4>
                <p className="text-sm whitespace-pre-wrap">
                  {getPreviewContent(formData.content) || 'Sem conteúdo'}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTemplate ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Excluir Template"
        description={`Tem certeza que deseja excluir o template "${deletingTemplate?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
