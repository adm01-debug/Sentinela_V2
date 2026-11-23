import { useMemo, useState } from "react";
import {
  AlertCircle,
  Copy,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
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
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/EmptyStates";
import {
  MessageTemplate,
  useCreateMessageTemplate,
  useDeleteMessageTemplate,
  useDuplicateMessageTemplate,
  useMessageTemplates,
  useToggleMessageTemplate,
  useUpdateMessageTemplate,
} from "@/hooks/useMessageTemplates";

const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "E-mail" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
];

const TEMPLATE_TYPES = [
  { value: "violation_alert", label: "Alerta de violacao" },
  { value: "weekly_report", label: "Relatorio semanal" },
  { value: "welcome", label: "Boas-vindas" },
  { value: "reminder", label: "Lembrete" },
];

interface TemplateFormData {
  name: string;
  description: string;
  template_type: string;
  channel: string;
  subject: string;
  body: string;
  variablesText: string;
  is_active: boolean;
}

const EMPTY_FORM: TemplateFormData = {
  name: "",
  description: "",
  template_type: "violation_alert",
  channel: "whatsapp",
  subject: "",
  body: "",
  variablesText: "",
  is_active: true,
};

const channelLabel = (value: string) => CHANNELS.find((c) => c.value === value)?.label ?? value;

export default function MessageTemplatesPage() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [deleting, setDeleting] = useState<MessageTemplate | null>(null);
  const [form, setForm] = useState<TemplateFormData>(EMPTY_FORM);

  const { data: templates = [], isLoading, isError, refetch } = useMessageTemplates();
  const createTemplate = useCreateMessageTemplate();
  const updateTemplate = useUpdateMessageTemplate();
  const deleteTemplate = useDeleteMessageTemplate();
  const toggleTemplate = useToggleMessageTemplate();
  const duplicateTemplate = useDuplicateMessageTemplate();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return templates.filter((item) => {
      if (channelFilter !== "all" && item.channel !== channelFilter) return false;
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        (item.description ?? "").toLowerCase().includes(term) ||
        item.body.toLowerCase().includes(term)
      );
    });
  }, [templates, search, channelFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEdit = (template: MessageTemplate) => {
    setEditing(template);
    setForm({
      name: template.name,
      description: template.description ?? "",
      template_type: template.template_type,
      channel: template.channel,
      subject: template.subject ?? "",
      body: template.body,
      variablesText: (template.variables ?? []).join(", "),
      is_active: template.is_active,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = () => {
    const variables = form.variablesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      template_type: form.template_type,
      channel: form.channel,
      subject: form.subject.trim() || null,
      body: form.body,
      variables,
      is_active: form.is_active,
    };

    if (!payload.name || !payload.body.trim()) return;

    if (editing) {
      updateTemplate.mutate({ id: editing.id, ...payload });
    } else {
      createTemplate.mutate(payload);
    }
    closeDialog();
  };

  const isSaving = createTemplate.isPending || updateTemplate.isPending;
  const canSubmit = form.name.trim().length > 0 && form.body.trim().length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modelos de Mensagem"
        description="Textos usados nos avisos automaticos por WhatsApp, e-mail, SMS e push. Variaveis entre chaves duplas sao preenchidas no envio."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo modelo
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Modelos cadastrados
          </CardTitle>
          <CardDescription>
            Desativar um modelo o remove da selecao do envio sem apagar o texto.
          </CardDescription>
          <div className="flex flex-col gap-2 pt-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, descricao ou texto"
                className="pl-9"
              />
            </div>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="sm:w-52">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os canais</SelectItem>
                {CHANNELS.map((channel) => (
                  <SelectItem key={channel.value} value={channel.value}>
                    {channel.label}
                  </SelectItem>
                ))}
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
              <p className="text-muted-foreground text-sm">Nao foi possivel carregar os modelos.</p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={templates.length === 0 ? "Nenhum modelo cadastrado" : "Nada encontrado"}
              description={
                templates.length === 0
                  ? "Sem modelos os avisos automaticos nao tem texto para enviar."
                  : "Ajuste a busca ou o filtro de canal."
              }
              primaryAction={
                templates.length === 0
                  ? { label: "Criar modelo", onClick: openCreate, icon: Plus }
                  : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead className="hidden md:table-cell">Variaveis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-muted-foreground line-clamp-1 max-w-md text-xs">
                        {template.description || template.body.replace(/\s+/g, " ").slice(0, 90)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{channelLabel(template.channel)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                      {(template.variables ?? []).length}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={(checked) =>
                            toggleTemplate.mutate({ id: template.id, is_active: checked })
                          }
                          aria-label={`Ativar ${template.name}`}
                        />
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(template)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => duplicateTemplate.mutate(template.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(template)}>
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
        onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeDialog())}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar modelo" : "Novo modelo"}</DialogTitle>
            <DialogDescription>Use {"{{variavel}}"} para inserir dados no envio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-name">Nome</Label>
                <Input
                  id="template-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Ex.: Alerta de violacao"
                />
              </div>
              <div className="space-y-2">
                <Label>Canal</Label>
                <Select
                  value={form.channel}
                  onValueChange={(value) => setForm({ ...form, channel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map((channel) => (
                      <SelectItem key={channel.value} value={channel.value}>
                        {channel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.template_type}
                  onValueChange={(value) => setForm({ ...form, template_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-subject">Assunto (e-mail)</Label>
                <Input
                  id="template-subject"
                  value={form.subject}
                  onChange={(event) => setForm({ ...form, subject: event.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Descricao</Label>
              <Input
                id="template-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Quando este modelo deve ser usado"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-body">Texto</Label>
              <Textarea
                id="template-body"
                value={form.body}
                onChange={(event) => setForm({ ...form, body: event.target.value })}
                rows={8}
                placeholder="Ola {{employee_name}}, foi detectado {{violation_type}}."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-variables">Variaveis</Label>
              <Input
                id="template-variables"
                value={form.variablesText}
                onChange={(event) => setForm({ ...form, variablesText: event.target.value })}
                placeholder="employee_name, violation_type, timestamp"
              />
              <p className="text-muted-foreground text-xs">Separe por virgula.</p>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Ativo</p>
                <p className="text-muted-foreground text-xs">
                  Desative para manter o modelo sem usalo nos envios.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir modelo?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.name}&quot; sera removido. Nao da para desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) deleteTemplate.mutate(deleting.id);
                setDeleting(null);
              }}
              disabled={deleteTemplate.isPending}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
