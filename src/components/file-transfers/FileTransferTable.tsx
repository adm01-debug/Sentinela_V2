import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileSymlink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CHANNEL_LABELS,
  SENSITIVITY_LABELS,
  VERDICT_LABELS,
  type FileTransfer,
} from '@/hooks/useFileTransfers';
import { formatBytes } from './format';

const verdictVariant: Record<FileTransfer['verdict'], string> = {
  allowed: 'bg-muted text-muted-foreground',
  flagged: 'bg-warning/15 text-warning',
  blocked: 'bg-destructive/15 text-destructive',
};

export interface FileTransferTableProps {
  transfers: FileTransfer[];
  isLoading: boolean;
}

export function FileTransferTable({ transfers, isLoading }: FileTransferTableProps) {
  const [selected, setSelected] = useState<FileTransfer | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSymlink className="h-5 w-5 text-primary" aria-hidden="true" />
          Transferências registradas
        </CardTitle>
        <CardDescription>
          Selecione um evento para ver hash de integridade, política acionada e evidências.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={`skeleton-row-${i}`} className="h-10 w-full" />
            ))}
          </div>
        ) : transfers.length === 0 ? (
          <EmptyState
            icon={FileSymlink}
            title="Nenhuma transferência encontrada"
            description="Nenhum evento corresponde aos filtros selecionados."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>Veredito</TableHead>
                  <TableHead>Quando</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t) => (
                  <TableRow
                    key={t.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelected(t)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelected(t);
                      }
                    }}
                    className="cursor-pointer odd:bg-muted/20 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <TableCell className="max-w-[280px] truncate font-medium">
                      {t.file_name}
                    </TableCell>
                    <TableCell>{CHANNEL_LABELS[t.channel]}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-muted-foreground">
                      {t.destination_domain ?? t.removable_device_label ?? t.destination_path ?? '—'}
                    </TableCell>
                    <TableCell>{formatBytes(t.file_size_bytes)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{SENSITIVITY_LABELS[t.sensitivity]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={verdictVariant[t.verdict]}>{VERDICT_LABELS[t.verdict]}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(t.occurred_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="truncate">{selected?.file_name}</DialogTitle>
            <DialogDescription>
              Detalhe do evento de transferência e evidências associadas.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Canal" value={CHANNEL_LABELS[selected.channel]} />
              <Detail
                label="Direção"
                value={selected.direction === 'out' ? 'Saída' : 'Entrada'}
              />
              <Detail label="Tamanho" value={formatBytes(selected.file_size_bytes)} />
              <Detail label="Extensão" value={selected.file_extension ?? '—'} />
              <Detail label="Aplicativo" value={selected.application ?? selected.process_name ?? '—'} />
              <Detail label="Domínio de destino" value={selected.destination_domain ?? '—'} />
              <Detail label="Origem" value={selected.source_path ?? '—'} />
              <Detail label="Destino" value={selected.destination_path ?? '—'} />
              <Detail
                label="Dispositivo removível"
                value={selected.removable_device_label ?? selected.removable_device_serial ?? '—'}
              />
              <Detail label="Classificação" value={SENSITIVITY_LABELS[selected.sensitivity]} />
              <Detail label="Veredito" value={VERDICT_LABELS[selected.verdict]} />
              <Detail
                label="Política acionada"
                value={selected.dlp_policy_id ? 'Sim — incidente DLP gerado' : 'Nenhuma'}
              />
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Hash SHA-256</dt>
                <dd className="break-all font-mono text-xs">{selected.file_hash ?? '—'}</dd>
              </div>
              {selected.recording_session_id && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Gravação correlacionada</dt>
                  <dd>
                    <a
                      className="text-primary underline underline-offset-4"
                      href={`/admin/session-recordings?session=${selected.recording_session_id}`}
                    >
                      Abrir trecho da sessão
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
