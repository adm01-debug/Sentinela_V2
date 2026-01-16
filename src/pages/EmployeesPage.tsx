import { useState } from 'react';
import { useEmployees, useDeleteEmployee } from '@/hooks';
import { DataTable } from '@/components/DataTable';
import { EmployeeFilters } from '@/components/EmployeeFilters';
import { AddEmployeeDialog } from '@/components/AddEmployeeDialog';
import { Button  } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const EmployeesPage = () => {
  const [filters, setFilters] = useState({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data, isLoading } = useEmployees(filters);
  const deleteEmployee = useDeleteEmployee();
  const navigate = useNavigate();

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => setShowAddDialog(true)}>Add Employee</Button>
      </div>
      <EmployeeFilters filters={filters} onChange={setFilters} />
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        onRowClick={(row) => navigate('/employees/' + row.id)}
        onDelete={(id) => deleteEmployee.mutate(id)}
      />
      <AddEmployeeDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
    </div>
  );
};