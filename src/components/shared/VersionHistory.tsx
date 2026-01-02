// ============================================================
// VERSION HISTORY COMPONENT
// Visualização e restauração de versões anteriores
// ============================================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { History, RotateCcw, User, Clock, Loader2, Eye, ArrowLeftRight } from 'lucide-react';
import { useVersions, type EntityVersion, type VersionDiff } from '@/hooks/useVersions';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================
// TYPES
// ============================================================

interface VersionHistoryProps {
  entityType: string;
  entityId: string;
  trigger?: React.ReactNode;
  className?: string;
}

// ============================================================
// DIFF COMPONENT
// ============================================================

function DiffView({ diffs }: { diffs: VersionDiff[] }) {
  if (diffs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Nenhuma alteração detectada
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {diffs.map((diff, i) => (
        <div
          key={i}
          className={cn(
            'p-2 rounded text-sm border-l-2',
            diff.type === 'added' && 'bg-green-50 border-green-500 dark:bg-green-950',
            diff.type === 'removed' && 'bg-red-50 border-red-500 dark:bg-red-950',
            diff.type === 'changed' && 'bg-yellow-50 border-yellow-500 dark:bg-yellow-950'
          )}
        >
          <div className="font-medium text-xs uppercase text-muted-foreground mb-1">
            {diff.field}
          </div>
          <div className="flex items-center gap-2">
            {diff.type !== 'added' && (
              <span className="text-muted-foreground line-through">
                {formatDiffValue(diff.oldValue)}
              </span>
            )}
            {diff.type === 'changed' && (
              <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
            )}
            {diff.type !== 'removed' && (
              <span className="font-medium">{formatDiffValue(diff.newValue)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDiffValue(value: unknown): string {
  if (value === null || value === undefined) return '(vazio)';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// ============================================================
// VERSION ITEM COMPONENT
// ============================================================

interface VersionItemProps {
  version: EntityVersion;
  previousVersion?: EntityVersion;
  isLatest: boolean;
  onRestore: () => void;
  onCompare: () => void;
  compareVersions: (v1: EntityVersion, v2: EntityVersion) => VersionDiff[];
  isRestoring: boolean;
}

function VersionItem({
  version,
  previousVersion,
  isLatest,
  onRestore,
  onCompare,
  compareVersions,
  isRestoring,
}: VersionItemProps) {
  const diffs = previousVersion ? compareVersions(previousVersion, version) : [];
  const timeAgo = formatDistanceToNow(new Date(version.changed_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <AccordionItem value={version.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3 text-left">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">Versão {version.version_number}</span>
              {isLatest && (
                <Badge variant="secondary" className="text-xs">
                  Atual
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
              {version.user?.full_name && (
                <>
                  <span>•</span>
                  <User className="h-3 w-3" />
                  <span>{version.user.full_name}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="space-y-4 pt-2">
          {version.change_summary && (
            <p className="text-sm text-muted-foreground">{version.change_summary}</p>
          )}

          {previousVersion && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Alterações em relação à versão anterior:
              </p>
              <DiffView diffs={diffs} />
            </div>
          )}

          {!isLatest && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCompare}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Visualizar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onRestore}
                disabled={isRestoring}
                className="gap-2"
              >
                {isRestoring ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Restaurar
              </Button>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function VersionHistory({
  entityType,
  entityId,
  trigger,
  className,
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<EntityVersion | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const {
    versions,
    isLoading,
    restoreVersion,
    compareVersions,
    isRestoring,
  } = useVersions({ entityType, entityId });

  const handleRestore = (version: EntityVersion) => {
    setSelectedVersion(version);
    setShowRestoreConfirm(true);
  };

  const confirmRestore = () => {
    if (selectedVersion) {
      restoreVersion(selectedVersion.id);
    }
    setShowRestoreConfirm(false);
    setSelectedVersion(null);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          {trigger ?? (
            <Button variant="outline" size="sm" className={cn('gap-2', className)}>
              <History className="h-4 w-4" />
              Histórico
            </Button>
          )}
        </SheetTrigger>

        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Versões
            </SheetTitle>
            <SheetDescription>
              Visualize e restaure versões anteriores deste registro
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-150px)] mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma versão anterior encontrada</p>
                <p className="text-sm">As alterações serão registradas aqui</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {versions.map((version, index) => (
                  <VersionItem
                    key={version.id}
                    version={version}
                    previousVersion={versions[index + 1]}
                    isLatest={index === 0}
                    onRestore={() => handleRestore(version)}
                    onCompare={() => setSelectedVersion(version)}
                    compareVersions={compareVersions}
                    isRestoring={isRestoring}
                  />
                ))}
              </Accordion>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Restore Confirmation */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar versão {selectedVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá substituir os dados atuais pelos dados desta versão.
              Uma nova versão será criada automaticamente com o estado atual antes da restauração.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default VersionHistory;
