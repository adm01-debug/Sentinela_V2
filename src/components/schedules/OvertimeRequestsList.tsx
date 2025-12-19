import { memo } from 'react';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OvertimeRequest {
  id: string;
  employee_id: string;
  requested_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Employee {
  id: string;
  name: string;
}

interface OvertimeRequestsListProps {
  requests: OvertimeRequest[];
  employees: Employee[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-warning/20 text-warning' },
  approved: { label: 'Aprovado', color: 'bg-success/20 text-success' },
  rejected: { label: 'Rejeitado', color: 'bg-destructive/20 text-destructive' },
};

function OvertimeRequestsListComponent({
  requests,
  employees,
  onApprove,
  onReject,
}: OvertimeRequestsListProps) {
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Funcionário não encontrado';
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma solicitação de hora extra</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const status = statusConfig[request.status];
        const isPending = request.status === 'pending';

        return (
          <Card key={request.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{getEmployeeName(request.employee_id)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(request.requested_date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <Badge className={status.color}>{status.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{request.start_time} - {request.end_time}</span>
              </div>

              {request.reason && (
                <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {request.reason}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Solicitado em {format(new Date(request.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>

              {isPending && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => onApprove(request.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(request.id)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export const OvertimeRequestsList = memo(OvertimeRequestsListComponent);
