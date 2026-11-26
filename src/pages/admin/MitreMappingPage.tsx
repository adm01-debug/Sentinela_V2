import { useMemo } from "react";
import {
  AlertTriangle,
  BookOpen,
  Crosshair,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
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
import { useMitreTechniques } from "@/hooks/useMitreTechniques";
import {
  INCIDENT_TYPES,
  INCIDENT_TYPE_LABEL,
  NOTES_MAX_LENGTH,
  confidenceLabel,
  confidencePercent,
  useMitreMappingPage,
  type IncidentType,
} from "@/hooks/useMitreMappingPage";

function formatDate(value: string | null): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return format(parsed, "dd/MM/yyyy HH:mm");
}

export default function MitreMappingPage() {
  const { techniques, loading: techniquesLoading } = useMitreTechniques();
  const page = useMitreMappingPage(techniques);

  const mappedTechniqueIds = useMemo(
    () => new Set(page.mappings.map((mapping) => mapping.technique_id)),
    [page.mappings]
  );

  const showFieldError = (field: keyof typeof page.errors) =>
    page.showErrors && page.errors[field] ? page.errors[field] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classificação MITRE ATT&CK"
        description="Vincule as técnicas do framework a incidentes DLP e violações de política para saber quais ameaças já apareceram na empresa."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={page.refetchAll} disabled={page.isLoading}>
              <RefreshCw
                className={page.isLoading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"}
              />
              Atualizar
            </Button>
            <Button onClick={page.openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Classificar incidente
            </Button>
          </div>
        }
      />

      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertTitle>A classificação é manual nesta tela</AlertTitle>
        <AlertDescription>
          O catálogo de técnicas vem do MITRE ATT&CK seedado no banco. Não existe classificador
          automático: o analista escolhe a técnica e a confiança de cada incidente, e a cobertura
          por tática é recalculada a partir dessas escolhas.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Técnicas no catálogo</CardDescription>
            <CardTitle className="text-2xl">{techniques.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            {page.tactics.length} táticas cobertas pelo framework
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Classificações registradas</CardDescription>
            <CardTitle className="text-2xl">{page.summary.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            {page.summary.incidents} incidentes distintos
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Técnicas observadas</CardDescription>
            <CardTitle className="text-2xl">{page.summary.techniques}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            {page.unmapped.length} técnicas ainda sem nenhum incidente
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confiança média</CardDescription>
            <CardTitle className="text-2xl">
              {confidencePercent(page.summary.avgConfidence)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            {confidenceLabel(page.summary.avgConfidence)} nas classificações registradas
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Cobertura por tática
          </CardTitle>
          <CardDescription>
            Quantas técnicas de cada tática já apareceram em pelo menos um incidente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {techniquesLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : page.coverage.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma técnica no catálogo. Rode o seed de <code>mitre_techniques</code> para
              começar.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {page.coverage.map((entry) => (
                <Badge
                  key={entry.tactic}
                  variant={entry.mapped > 0 ? "default" : "secondary"}
                  className="px-3 py-1"
                >
                  {entry.tactic}: {entry.mapped}/{entry.total}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {page.isError ? (
        <div className="py-12">
          <EmptyState
            icon={AlertTriangle}
            title="Não foi possível carregar as classificações"
            description={
              page.error instanceof Error
                ? page.error.message
                : "Verifique a conexão com o banco e tente novamente."
            }
            primaryAction={{
              label: "Tentar novamente",
              onClick: page.refetchAll,
              icon: RefreshCw,
            }}
          />
        </div>
      ) : page.isLoading || techniquesLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Crosshair className="h-4 w-4" />
                  Classificações
                </CardTitle>
                <CardDescription>
                  {page.visibleMappings.length} de {page.mappings.length} classificações
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  className="w-[280px] pl-9"
                  placeholder="Buscar por incidente, técnica ou observação"
                  value={page.term}
                  onChange={(event) => page.setTerm(event.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {page.visibleMappings.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={ShieldCheck}
                    title={
                      page.term
                        ? "Nenhuma classificação com essa busca"
                        : "Nenhum incidente classificado"
                    }
                    description={
                      page.term
                        ? "Ajuste a busca para encontrar o incidente ou a técnica."
                        : "Sem classificação, a cobertura MITRE fica zerada e a resposta a incidentes perde priorização."
                    }
                    primaryAction={
                      page.term
                        ? { label: "Limpar busca", onClick: () => page.setTerm("") }
                        : { label: "Classificar incidente", onClick: page.openCreate, icon: Plus }
                    }
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Incidente</TableHead>
                      <TableHead>Técnica</TableHead>
                      <TableHead>Confiança</TableHead>
                      <TableHead>Observação</TableHead>
                      <TableHead>Registrado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {page.visibleMappings.map((mapping) => {
                      const technique = page.techniqueById(mapping.technique_id);
                      return (
                        <TableRow key={mapping.id}>
                          <TableCell>
                            <div className="font-medium">{page.incidentLabel(mapping)}</div>
                            <div className="text-muted-foreground text-xs">
                              {INCIDENT_TYPE_LABEL[mapping.incident_type as IncidentType] ??
                                mapping.incident_type}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {technique
                                ? `${technique.id} · ${technique.name}`
                                : mapping.technique_id}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {technique?.tactic ?? "Tática não carregada"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={mapping.confidence >= 0.7 ? "default" : "secondary"}>
                              {confidencePercent(mapping.confidence)}% ·{" "}
                              {confidenceLabel(mapping.confidence)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[240px] truncate text-xs">
                            {mapping.metadata?.notes || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {formatDate(mapping.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => page.openEdit(mapping)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar classificação</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => page.setRemoving(mapping)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remover classificação</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4" />
                  Catálogo de técnicas
                </CardTitle>
                <CardDescription>
                  {page.visibleTechniques.length} de {techniques.length} técnicas do framework
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    className="w-[220px] pl-9"
                    placeholder="Buscar técnica ou tática"
                    value={page.techniqueTerm}
                    onChange={(event) => page.setTechniqueTerm(event.target.value)}
                  />
                </div>
                <Select
                  value={page.tactic || "all"}
                  onValueChange={(value) => page.setTactic(value === "all" ? "" : value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Todas as táticas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as táticas</SelectItem>
                    {page.tactics.map((tactic) => (
                      <SelectItem key={tactic} value={tactic}>
                        {tactic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {page.visibleTechniques.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={BookOpen}
                    title="Nenhuma técnica com esse filtro"
                    description="Ajuste a busca ou volte para todas as táticas."
                    primaryAction={{
                      label: "Limpar filtros",
                      onClick: () => {
                        page.setTechniqueTerm("");
                        page.setTactic("");
                      },
                    }}
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Técnica</TableHead>
                      <TableHead>Tática</TableHead>
                      <TableHead>Severidade padrão</TableHead>
                      <TableHead>Uso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {page.visibleTechniques.map((technique) => (
                      <TableRow key={technique.id}>
                        <TableCell className="font-mono text-xs">{technique.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{technique.name}</div>
                          <div className="text-muted-foreground max-w-[420px] truncate text-xs">
                            {technique.description ?? "Sem descrição"}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{technique.tactic}</TableCell>
                        <TableCell>
                          <Badge variant={page.severityVariant(technique.severity_default)}>
                            {technique.severity_default}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {mappedTechniqueIds.has(technique.id) ? (
                            <Badge variant="default">Usada</Badge>
                          ) : (
                            <Badge variant="secondary">Sem incidente</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={page.dialogOpen} onOpenChange={page.handleDialogOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {page.editing ? "Editar classificação" : "Classificar incidente"}
            </DialogTitle>
            <DialogDescription>
              Cada par incidente + técnica é único. A confiança indica o quanto o analista acredita
              que a técnica foi realmente usada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mitre-incident-type">Tipo de incidente</Label>
                <Select
                  value={page.formData.incidentType}
                  onValueChange={(value) =>
                    page.setFormData({
                      ...page.formData,
                      incidentType: value as IncidentType,
                      incidentId: "",
                    })
                  }
                >
                  <SelectTrigger id="mitre-incident-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {INCIDENT_TYPE_LABEL[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showFieldError("incidentType") && (
                  <p className="text-destructive text-xs">{page.errors.incidentType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mitre-confidence">Confiança (0 a 1)</Label>
                <Input
                  id="mitre-confidence"
                  inputMode="decimal"
                  value={page.formData.confidence}
                  onChange={(event) =>
                    page.setFormData({ ...page.formData, confidence: event.target.value })
                  }
                />
                {showFieldError("confidence") ? (
                  <p className="text-destructive text-xs">{page.errors.confidence}</p>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    {confidencePercent(Number(page.formData.confidence.replace(",", ".")))}% ·{" "}
                    {confidenceLabel(Number(page.formData.confidence.replace(",", ".")))}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mitre-incident">Incidente</Label>
              <Select
                value={page.formData.incidentId}
                onValueChange={(value) => page.setFormData({ ...page.formData, incidentId: value })}
              >
                <SelectTrigger id="mitre-incident">
                  <SelectValue placeholder="Selecione o incidente" />
                </SelectTrigger>
                <SelectContent>
                  {page.incidentsForType(page.formData.incidentType).length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      Nenhum incidente disponível
                    </SelectItem>
                  ) : (
                    page.incidentsForType(page.formData.incidentType).map((incident) => (
                      <SelectItem key={incident.id} value={incident.id}>
                        {incident.label} · {formatDate(incident.occurredAt)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {showFieldError("incidentId") && (
                <p className="text-destructive text-xs">{page.errors.incidentId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mitre-technique">Técnica MITRE</Label>
              <Select
                value={page.formData.techniqueId}
                onValueChange={(value) =>
                  page.setFormData({ ...page.formData, techniqueId: value })
                }
              >
                <SelectTrigger id="mitre-technique">
                  <SelectValue placeholder="Selecione a técnica" />
                </SelectTrigger>
                <SelectContent>
                  {techniques.map((technique) => (
                    <SelectItem key={technique.id} value={technique.id}>
                      {technique.id} · {technique.name} ({technique.tactic})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showFieldError("techniqueId") && (
                <p className="text-destructive text-xs">{page.errors.techniqueId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mitre-notes">Observação (opcional)</Label>
              <Textarea
                id="mitre-notes"
                rows={3}
                maxLength={NOTES_MAX_LENGTH}
                placeholder="Por que essa técnica se aplica ao incidente"
                value={page.formData.notes}
                onChange={(event) =>
                  page.setFormData({ ...page.formData, notes: event.target.value })
                }
              />
              {showFieldError("notes") ? (
                <p className="text-destructive text-xs">{page.errors.notes}</p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {page.formData.notes.length}/{NOTES_MAX_LENGTH} caracteres
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
              {page.editing ? "Salvar alterações" : "Classificar incidente"}
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
            <AlertDialogTitle>Remover classificação?</AlertDialogTitle>
            <AlertDialogDescription>
              A técnica deixa de contar para este incidente e a cobertura por tática é recalculada.
              O incidente em si não é alterado.
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
