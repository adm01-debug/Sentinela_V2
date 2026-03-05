import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/DataTable';

export default function AuditLog() {
  const { data = [] } = useQuery({ queryKey: ['audit'], queryFn: async () => [{ action: 'login', user: 'admin', time: new Date().toISOString() }] });
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Audit Log</h1>
      <DataTable
        data={data}
        columns={[
          { key: 'action', header: 'Action' },
          { key: 'user', header: 'User' },
          { key: 'time', header: 'Time' },
        ]}
        keyExtractor={(row) => `${row.action}-${row.time}`}
      />
    </div>
  );
}
