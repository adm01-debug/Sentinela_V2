import { useState } from 'react';
import { useEmployees, useDeleteEmployee } from '@/hooks/useEmployees';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const EmployeesPage = () => {
  const [filters] = useState({});
  const { data, isLoading } = useEmployees(filters);
  const deleteEmployee = useDeleteEmployee();
  const navigate = useNavigate();

  const employees = Array.isArray(data) ? data : [];

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => navigate('/employees/create')}>Add Employee</Button>
      </div>
      <DataTable
        columns={columns}
        data={employees}
        isLoading={isLoading}
        keyExtractor={(row: Record<string, unknown>) => String(row.id)}
      />
    </div>
  );
};

export default EmployeesPage;
