import { memo, useCallback } from 'react';
import { Edit2, Trash2, Clock, Coffee, Timer, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { WorkSchedule } from '@/hooks/useWorkSchedules';
import { formatWorkDays, calculateWorkHours } from '@/hooks/useWorkSchedulesPage';

interface SchedulesListProps {
  schedules: WorkSchedule[];
  onEdit: (schedule: WorkSchedule) => void;
  onDelete: (schedule: WorkSchedule) => void;
}

function SchedulesListComponent({ schedules, onEdit, onDelete }: SchedulesListProps) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum horário cadastrado</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {schedules.map((schedule) => {
        const workHours = calculateWorkHours(
          schedule.start_time,
          schedule.end_time,
          schedule.break_start || undefined,
          schedule.break_end || undefined
        );

        return (
          <Card key={schedule.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{schedule.name}</CardTitle>
                  {schedule.description && (
                    <CardDescription className="mt-1">
                      {schedule.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(schedule)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(schedule)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Excluir</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Work Hours */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{schedule.start_time} - {schedule.end_time}</span>
                <Badge variant="secondary">{workHours.toFixed(1)}h</Badge>
              </div>

              {/* Break */}
              {schedule.break_start && schedule.break_end && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Coffee className="h-4 w-4" />
                  <span>Intervalo: {schedule.break_start} - {schedule.break_end}</span>
                </div>
              )}

              {/* Work Days */}
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span>{formatWorkDays(schedule.work_days)}</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {schedule.flexible_start && (
                  <Badge variant="outline">
                    Flexível ±{schedule.flexible_minutes}min
                  </Badge>
                )}
                {schedule.overtime_allowed && (
                  <Badge variant="outline" className="bg-green-500/10">
                    HE Permitida
                  </Badge>
                )}
                {schedule.block_outside_hours ? (
                  <Badge variant="outline" className="bg-red-500/10">
                    <Lock className="h-3 w-3 mr-1" />
                    Bloqueio Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-500/10">
                    <Unlock className="h-3 w-3 mr-1" />
                    Sem Bloqueio
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export const SchedulesList = memo(SchedulesListComponent);
