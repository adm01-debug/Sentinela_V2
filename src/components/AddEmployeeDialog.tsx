import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCreateEmployee, type EmployeeCreateInput } from '@/hooks/useEmployees';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
}

const departments = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
];

const roles = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'manager', label: 'Manager' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AddEmployeeDialog = ({ open, onClose }: Props) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: 'engineering',
    role: 'developer',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const createEmployee = useCreateEmployee();

  const validate = (): boolean => {
    const next: { name?: string; email?: string } = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!EMAIL_RE.test(form.email)) next.email = 'Valid email is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createEmployee.mutate(
      { name: form.name, full_name: form.name, email: form.email, department: form.department, role: form.role } as EmployeeCreateInput,
      {
        onSuccess: () => {
          onClose();
          setForm({ name: '', email: '', department: 'engineering', role: 'developer' });
          setErrors({});
        },
        onError: (err) => {
          toast({
            variant: 'destructive',
            title: 'Failed to add employee',
            description: err instanceof Error ? err.message : 'An unexpected error occurred',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={form.department}
              onValueChange={(value) => setForm({ ...form, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) => setForm({ ...form, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={createEmployee.isPending}>
            Add Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
