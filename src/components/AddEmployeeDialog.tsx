import { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from './ui/Dialog';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { useCreateEmployee } from '@/hooks';

interface Props { open: boolean; onClose: () => void; }

const departments = [{ value: 'engineering', label: 'Engineering' }, { value: 'sales', label: 'Sales' }, { value: 'marketing', label: 'Marketing' }];
const roles = [{ value: 'developer', label: 'Developer' }, { value: 'designer', label: 'Designer' }, { value: 'manager', label: 'Manager' }];

export const AddEmployeeDialog = ({ open, onClose }: Props) => {
  const [form, setForm] = useState({ name: '', email: '', department: 'engineering', role: 'developer' });
  const createEmployee = useCreateEmployee();

  const handleSubmit = () => {
    createEmployee.mutate({ ...form, status: 'active', hireDate: new Date().toISOString() }, { onSuccess: () => { onClose(); setForm({ name: '', email: '', department: 'engineering', role: 'developer' }); } });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
      <DialogContent>
        <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Select label="Department" options={departments} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
        <Select label="Role" options={roles} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={createEmployee.isPending}>Add Employee</Button>
      </DialogFooter>
    </Dialog>
  );
};