import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SystemHealth() {
  const services = [{ name: 'API', status: 'healthy' }, { name: 'Database', status: 'healthy' }, { name: 'Cache', status: 'warning' }];
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>System Health</h1>
      <div className='grid gap-4 md:grid-cols-3'>
        {services.map(s => <Card key={s.name}><CardHeader><CardTitle>{s.name}</CardTitle></CardHeader><CardContent><Badge variant={s.status === 'healthy' ? 'default' : 'secondary'}>{s.status}</Badge></CardContent></Card>)}
      </div>
    </div>
  );
}