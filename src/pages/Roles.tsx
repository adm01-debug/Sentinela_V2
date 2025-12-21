import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';

export default function Roles() {
  const roles = [{ name: 'Admin', users: 5 }, { name: 'Manager', users: 10 }, { name: 'User', users: 50 }];
  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between mb-6'><h1 className='text-2xl font-bold'>Roles</h1><Button>Add Role</Button></div>
      <DataTable data={roles} columns={[{ accessorKey: 'name', header: 'Role' }, { accessorKey: 'users', header: 'Users' }]} />
    </div>
  );
}