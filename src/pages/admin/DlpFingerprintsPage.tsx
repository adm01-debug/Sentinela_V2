import {
  AlertTriangle,
  FileKey,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  Power,
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
  ACTIONS,
  ACTION_LABEL,
  MAX_CHUNKS_PER_DOCUMENT,
  SEVERITIES,
  SEVERITY_LABEL,
  TEXT_FILE_EXTENSIONS,
  chunkText,
  formatChunkLabel,
  useDlpFingerprintsPage,
  type FingerprintAction,
  type FingerprintSeverity,
} from "@/hooks/useDlpFingerprintsPage";

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return format(parsed, "dd/MM/yyyy HH:mm");
}

export default function DlpFingerprintsPage() {
  const page = useDlpFingerprintsPage();
  const estimatedChunks = chunkText(page.formData.text).length;

  const severityVariant = (severity: FingerprintSeverity) =>
    severity === "critical" || severity === "high"
      ? "destructive"
      : severity === "medium"
        ? "default"
        : "secondary";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fingerprints de Documentos"
        description="Registre documentos sigilosos por hash SHA-256 dos chunks para detectar vazamento por comparação de conteúdo (Exact Data Match)."
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
              Novo documento
            </Button>
          </div>
        }
      />

      <Alert>
        <Lock className="h-4 w-4" />
        <AlertTitle>O conteúdo nunca sai do navegador</AlertTitle>
        <AlertDescription>
          O texto é normalizado e dividido em chunks de 256 caracteres; só os hashes SHA-256 são
          gravados. O matcher automático no agente (US-F3-02 do roadmap DLP) ainda não consome esses
          hashes, então hoje o registro é cadastro e gestão da base.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documentos registrados</CardDescription>
            <CardTitle className="text-2xl">{page.documents.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            {page.activeDocuments} com fingerprints ativos
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Chunks hasheados</CardDescription>
            <CardTitle className="text-2xl">{page.totalRows}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            {page.documents.length === 0
              ? "Nenhum hash gravado"
              : `Média de ${Math.round(page.totalRows / page.documents.length)} chunks por documento`}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documentos desativados</CardDescription>
            <CardTitle className="text-2xl">
              {page.documents.length - page.activeDocuments}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Hashes preservados, fora de uso
          </CardContent>
        </Card>
      </div>

      {page.isError ? (
        <div className="py-12">
          <EmptyState
            icon={AlertTriangle}
            title="Não foi possível carregar os fingerprints"
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
              <CardTitle className="text-base">Documentos protegidos</CardTitle>
              <CardDescription>
                {page.visibleDocuments.length} de {page.documents.length} documentos
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                className="w-[260px] pl-9"
                placeholder="Buscar por nome, tipo ou ação"
                value={page.term}
                onChange={(event) => page.setTerm(event.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {page.visibleDocuments.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={FileKey}
                  title={
                    page.term ? "Nenhum documento com essa busca" : "Nenhum documento registrado"
                  }
                  description={
                    page.term
                      ? "Ajuste a busca para encontrar o documento."
                      : "Sem fingerprint, nenhum conteúdo de documento sigiloso pode ser comparado."
                  }
                  primaryAction={
                    page.term
                      ? { label: "Limpar busca", onClick: () => page.setTerm("") }
                      : { label: "Novo documento", onClick: page.openCreate, icon: Plus }
                  }
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Chunks</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Registrado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {page.visibleDocuments.map((document) => (
                    <TableRow key={document.documentName}>
                      <TableCell>
                        <div className="font-medium">{document.documentName}</div>
                        <div className="text-muted-foreground text-xs">
                          {document.documentType
                            ? document.documentType.toUpperCase()
                            : "tipo não informado"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatChunkLabel(document.storedChunks, document.totalChunks)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={severityVariant(document.severity)}>
                          {SEVERITY_LABEL[document.severity]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{ACTION_LABEL[document.action]}</TableCell>
                      <TableCell>
                        <Badge variant={document.isActive ? "default" : "secondary"}>
                          {document.isActive ? "Ativo" : "Desativado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(document.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => page.openTuning(document)}
                          >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="sr-only">Ajustar classificação</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => page.toggleDocument(document)}
                          >
                            <Power className="h-4 w-4" />
                            <span className="sr-only">
                              {document.isActive ? "Desativar documento" : "Ativar documento"}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => page.setRemoving(document)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remover documento</span>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo documento sigiloso</DialogTitle>
            <DialogDescription>
              Envie um arquivo de texto ou cole o conteúdo. O sistema divide o texto em chunks de
              256 caracteres e grava apenas o hash SHA-256 de cada um.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fp-name">Nome do documento</Label>
                <Input
                  id="fp-name"
                  placeholder="Contrato-mestre-2026.txt"
                  value={page.formData.documentName}
                  onChange={(event) =>
                    page.setFormData({ ...page.formData, documentName: event.target.value })
                  }
                />
                {page.showErrors && page.errors.documentName && (
                  <p className="text-destructive text-xs">{page.errors.documentName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fp-type">Tipo (opcional)</Label>
                <Input
                  id="fp-type"
                  placeholder="contrato, rh, financeiro"
                  value={page.formData.documentType}
                  onChange={(event) =>
                    page.setFormData({ ...page.formData, documentType: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fp-severity">Severidade ao detectar</Label>
                <Select
                  value={page.formData.severity}
                  onValueChange={(value) =>
                    page.setFormData({ ...page.formData, severity: value as FingerprintSeverity })
                  }
                >
                  <SelectTrigger id="fp-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {SEVERITY_LABEL[severity]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fp-action">Ação ao detectar</Label>
                <Select
                  value={page.formData.action}
                  onValueChange={(value) =>
                    page.setFormData({ ...page.formData, action: value as FingerprintAction })
                  }
                >
                  <SelectTrigger id="fp-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((action) => (
                      <SelectItem key={action} value={action}>
                        {ACTION_LABEL[action]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fp-file">Arquivo de texto</Label>
              <Input
                id="fp-file"
                type="file"
                accept=".txt,.csv,.md,.json,.log,.xml,.html,.sql,text/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void page.handleFile(file);
                }}
              />
              <p className="text-muted-foreground text-xs">
                Formatos aceitos:{" "}
                {TEXT_FILE_EXTENSIONS.map((extension) => `.${extension}`).join(", ")}. PDF e DOCX
                precisam do texto exportado.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fp-text">Conteúdo do documento</Label>
              <Textarea
                id="fp-text"
                rows={8}
                placeholder="Cole aqui o texto do documento sigiloso"
                value={page.formData.text}
                onChange={(event) =>
                  page.setFormData({ ...page.formData, text: event.target.value })
                }
              />
              {page.showErrors && page.errors.text ? (
                <p className="text-destructive text-xs">{page.errors.text}</p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {page.formData.text.length} caracteres · {estimatedChunks} chunk(s)
                  {estimatedChunks >= MAX_CHUNKS_PER_DOCUMENT
                    ? ` · limite de ${MAX_CHUNKS_PER_DOCUMENT}`
                    : ""}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => page.handleDialogOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={page.handleSubmit} disabled={page.isSaving}>
              {page.isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Gerar fingerprints
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={page.tuning !== null}
        onOpenChange={(open) => {
          if (!open) page.setTuning(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustar classificação</DialogTitle>
            <DialogDescription>
              Vale para todos os chunks de {page.tuning?.documentName ?? "documento"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-tune-severity">Severidade</Label>
              <Select
                value={page.tuningForm.severity}
                onValueChange={(value) =>
                  page.setTuningForm({
                    ...page.tuningForm,
                    severity: value as FingerprintSeverity,
                  })
                }
              >
                <SelectTrigger id="fp-tune-severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {SEVERITY_LABEL[severity]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-tune-action">Ação</Label>
              <Select
                value={page.tuningForm.action}
                onValueChange={(value) =>
                  page.setTuningForm({ ...page.tuningForm, action: value as FingerprintAction })
                }
              >
                <SelectTrigger id="fp-tune-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {ACTION_LABEL[action]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => page.setTuning(null)}>
              Cancelar
            </Button>
            <Button onClick={page.handleTuningSubmit} disabled={page.isTuning}>
              {page.isTuning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
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
            <AlertDialogTitle>Remover documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os hashes de {page.removing?.documentName ?? "documento"} serão apagados e o
              documento deixa de constar na base de fingerprints.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={page.handleRemove}
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
