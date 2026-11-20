import { useState } from "react";
import { format, parseISO } from "date-fns";
import { History, RotateCcw, GitCompareArrows } from "lucide-react";
import { useVersions, type EntityVersion, type VersionDiff } from "@/hooks/useVersions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

interface EntityVersionsPanelProps {
  entityType: string;
  entityId: string;
  entityLabel?: string;
}

function formatData(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function DiffRow({ diff }: { diff: VersionDiff }) {
  return (
    <div className="flex flex-col gap-1 border-b py-2 text-sm last:border-0">
      <div className="flex items-center gap-2">
        <span className="font-medium">{diff.field}</span>
        <Badge
          variant={
            diff.type === "changed" ? "default" : diff.type === "added" ? "success" : "destructive"
          }
          size="sm"
        >
          {diff.type === "added" ? "adicionado" : diff.type === "removed" ? "removido" : "alterado"}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded bg-muted p-2 text-muted-foreground line-through">
          {formatData(diff.oldValue)}
        </div>
        <div className="rounded bg-muted/60 p-2">{formatData(diff.newValue)}</div>
      </div>
    </div>
  );
}

export function EntityVersionsPanel({
  entityType,
  entityId,
  entityLabel = "registro",
}: EntityVersionsPanelProps) {
  const { versions, isLoading, error, restoreVersion, isRestoring, compareVersions } = useVersions({
    entityType,
    entityId,
  });

  const [versionToRestore, setVersionToRestore] = useState<EntityVersion | null>(null);
  const [diffTarget, setDiffTarget] = useState<EntityVersion | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={72} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<History className="h-8 w-8" />}
        title="Nao foi possivel carregar o historico"
        description={error instanceof Error ? error.message : "Erro desconhecido"}
      />
    );
  }

  if (versions.length === 0) {
    return (
      <EmptyState
        icon={<History className="h-8 w-8" />}
        title="Sem versoes registradas"
        description={`Alteracoes neste ${entityLabel} geram nova versao automaticamente.`}
      />
    );
  }

  const olderVersions = versions.slice(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" /> Historico de versoes
        </CardTitle>
        <CardDescription>
          {versions.length} versao(ões) salvas para este {entityLabel}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 text-sm font-medium">Versao atual</div>
          <div className="rounded-lg border bg-card p-4">
            <VersionRow
              version={versions[0]}
              isLatest
              onRestore={() => setVersionToRestore(versions[0])}
            />
          </div>
        </div>

        {olderVersions.length > 0 && (
          <div>
            <div className="mb-2 text-sm font-medium">Historico</div>
            <div className="space-y-2">
              {olderVersions.map((version) => (
                <VersionRow
                  key={version.id}
                  version={version}
                  onRestore={() => setVersionToRestore(version)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={!!diffTarget} onOpenChange={(open) => !open && setDiffTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Diferencas da versao {diffTarget?.version_number}</DialogTitle>
            <DialogDescription>Comparacao com a versao mais recente.</DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {diffTarget && versions.length > 0 ? (
              compareVersions(diffTarget, versions[0]).map((diff, i) => (
                <DiffRow key={i} diff={diff} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sem diferencas.</p>
            )}
          </div>
          <DialogFooter />
        </DialogContent>
      </Dialog>

      <Dialog open={!!versionToRestore} onOpenChange={(open) => !open && setVersionToRestore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar versao {versionToRestore?.version_number}?</DialogTitle>
            <DialogDescription>
              O estado atual sera preservado como nova versao no historico antes da restauracao.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setVersionToRestore(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isRestoring}
              onClick={() => {
                if (versionToRestore) {
                  restoreVersion(versionToRestore.id);
                  setVersionToRestore(null);
                }
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {isRestoring ? "Restaurando..." : "Restaurar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );

  function VersionRow({
    version,
    isLatest = false,
    onRestore,
  }: {
    version: EntityVersion;
    isLatest?: boolean;
    onRestore: () => void;
  }) {
    const author = version.user?.full_name ?? version.user?.email ?? "Sistema";
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">v{version.version_number}</span>
          {isLatest && (
            <Badge variant="success" size="sm">
              atual
            </Badge>
          )}
        </div>
        <div className="min-w-0 flex-1 text-sm text-muted-foreground">
          <span className="block truncate">{version.change_summary ?? "Sem resumo"}</span>
          <span className="text-xs">
            {author} ·{" "}
            {version.changed_at ? format(parseISO(version.changed_at), "dd/MM/yyyy HH:mm") : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDiffTarget(version)}>
            <GitCompareArrows className="mr-2 h-4 w-4" /> Comparar
          </Button>
          <Button variant="outline" size="sm" onClick={onRestore} disabled={isLatest}>
            <RotateCcw className={cn("mr-2 h-4 w-4", isLatest && "opacity-40")} /> Restaurar
          </Button>
        </div>
      </div>
    );
  }
}

export default EntityVersionsPanel;
