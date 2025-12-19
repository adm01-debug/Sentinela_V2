import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ScheduleFormData } from '@/hooks/useWorkSchedulesPage';
import { WEEKDAYS } from '@/hooks/useWorkSchedulesPage';

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ScheduleFormData;
  setFormData: (data: ScheduleFormData) => void;
  onToggleWorkDay: (day: number) => void;
  onSubmit: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

function ScheduleFormDialogComponent({
  open,
  onOpenChange,
  formData,
  setFormData,
  onToggleWorkDay,
  onSubmit,
  isEditing = false,
  isSubmitting = false,
}: ScheduleFormDialogProps) {
  const handleChange = (field: keyof ScheduleFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Horário' : 'Novo Horário de Trabalho'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name & Description */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Horário *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Horário Comercial, Turno Manhã"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição opcional..."
              rows={2}
            />
          </div>

          {/* Work Days */}
          <div className="space-y-2">
            <Label>Dias de Trabalho</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <label
                  key={day.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Checkbox
                    checked={formData.work_days.includes(day.value)}
                    onCheckedChange={() => onToggleWorkDay(day.value)}
                  />
                  <span className="text-sm">{day.short}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Work Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Início do Expediente</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Fim do Expediente</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
              />
            </div>
          </div>

          {/* Break */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="break_start">Início do Intervalo</Label>
              <Input
                id="break_start"
                type="time"
                value={formData.break_start}
                onChange={(e) => handleChange('break_start', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break_end">Fim do Intervalo</Label>
              <Input
                id="break_end"
                type="time"
                value={formData.break_end}
                onChange={(e) => handleChange('break_end', e.target.value)}
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label>Horário Flexível</Label>
                <p className="text-sm text-muted-foreground">
                  Permite tolerância no início do expediente
                </p>
              </div>
              <Switch
                checked={formData.flexible_start}
                onCheckedChange={(checked) => handleChange('flexible_start', checked)}
              />
            </div>

            {formData.flexible_start && (
              <div className="space-y-2 ml-4">
                <Label htmlFor="flexible_minutes">Minutos de Tolerância</Label>
                <Input
                  id="flexible_minutes"
                  type="number"
                  value={formData.flexible_minutes}
                  onChange={(e) => handleChange('flexible_minutes', parseInt(e.target.value) || 0)}
                  className="w-24"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Hora Extra Permitida</Label>
                <p className="text-sm text-muted-foreground">
                  Permite trabalho fora do horário
                </p>
              </div>
              <Switch
                checked={formData.overtime_allowed}
                onCheckedChange={(checked) => handleChange('overtime_allowed', checked)}
              />
            </div>

            {formData.overtime_allowed && (
              <div className="flex items-center justify-between ml-4">
                <div>
                  <Label>Requer Aprovação</Label>
                  <p className="text-sm text-muted-foreground">
                    HE precisa ser aprovada pelo gestor
                  </p>
                </div>
                <Switch
                  checked={formData.overtime_requires_approval}
                  onCheckedChange={(checked) => handleChange('overtime_requires_approval', checked)}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Bloquear Fora do Horário</Label>
                <p className="text-sm text-muted-foreground">
                  Impede acesso ao sistema fora do expediente
                </p>
              </div>
              <Switch
                checked={formData.block_outside_hours}
                onCheckedChange={(checked) => handleChange('block_outside_hours', checked)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={!formData.name.trim() || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const ScheduleFormDialog = memo(ScheduleFormDialogComponent);
