import { memo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Monitor, ExternalLink, Image as ImageIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PolicyAcknowledgment } from '@/hooks/usePolicyAcknowledgments';

interface PolicyAcknowledgmentsTableProps {
  acknowledgments: PolicyAcknowledgment[];
  isLoading?: boolean;
}

function PolicyAcknowledgmentsTableComponent({ 
  acknowledgments, 
  isLoading 
}: PolicyAcknowledgmentsTableProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (acknowledgments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum aceite encontrado
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Funcionário</TableHead>
            <TableHead>Política</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Dispositivo</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {acknowledgments.map((ack) => (
            <TableRow key={ack.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{ack.employee?.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {ack.employee?.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {ack.policy?.name} v{ack.policy?.version}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(ack.acknowledged_at), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                {ack.location ? (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {ack.location.latitude.toFixed(4)}, {ack.location.longitude.toFixed(4)}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Monitor className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">
                    {ack.user_agent?.split(' ')[0] || 'Desconhecido'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {ack.screenshot_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedScreenshot(ack.screenshot_url!)}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  )}
                  {ack.location && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps?q=${ack.location!.latitude},${ack.location!.longitude}`,
                          '_blank'
                        );
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Screenshot do Aceite</DialogTitle>
          </DialogHeader>
          {selectedScreenshot && (
            <img
              src={selectedScreenshot}
              alt="Screenshot do aceite"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export const PolicyAcknowledgmentsTable = memo(PolicyAcknowledgmentsTableComponent);
