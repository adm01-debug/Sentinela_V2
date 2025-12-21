import { useQuery } from '@tanstack/react-query';

export default function Logs() {
  const { data = [] } = useQuery({ queryKey: ['logs'], queryFn: async () => [{ level: 'info', message: 'App started', time: new Date().toISOString() }] });
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>System Logs</h1>
      <div className='space-y-2 font-mono text-sm'>
        {data.map((log, i) => <div key={i} className='p-2 bg-muted rounded'>[{log.level}] {log.time} - {log.message}</div>)}
      </div>
    </div>
  );
}