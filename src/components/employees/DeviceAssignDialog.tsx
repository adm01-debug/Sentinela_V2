import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DeviceFormData } from '@/hooks/useEmployeesPage';
import type { EmployeeWithDetails } from '@/hooks/useEmployees';

interface DeviceAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeWithDetails | null;
  deviceData: DeviceFormData;
  setDeviceData: (data: DeviceFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

function DeviceAssignDialogComponent({
  open,
  onOpenChange,
  employee,
  deviceData,
  setDeviceData,
  onSubmit,
  isSubmitting = false,
}: DeviceAssignDialogProps) {
  const handleChange = (field: keyof DeviceFormData, value: string | boolean) => {
    setDeviceData({ ...deviceData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vincular Dispositivo</DialogTitle>
          <DialogDescription>
            {employee ? `Vincule um dispositivo a ${employee.name}` : 'Vincule um dispositivo'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="device_name">Nome do Dispositivo *</Label>
            <Input
              id="device_name"
              value={deviceData.device_name}
              onChange={(e) => handleChange('device_name', e.target.value)}
              placeholder="Ex: Desktop-001, Notebook-Maria"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="device_type">Tipo de Dispositivo</Label>
            <Select
              value={deviceData.device_type}
              onValueChange={(value) => handleChange('device_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_primary"
              checked={deviceData.is_primary}
              onCheckedChange={(checked) => handleChange('is_primary', !!checked)}
            />
            <Label htmlFor="is_primary" className="cursor-pointer">
              Dispositivo principal
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!deviceData.device_name.trim() || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Vincular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const DeviceAssignDialog = memo(DeviceAssignDialogComponent);
