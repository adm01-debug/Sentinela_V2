import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Compliance() {
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Compliance Dashboard</h1>
      <div className='grid gap-4 md:grid-cols-3'>
        <Card><CardHeader><CardTitle>LGPD</CardTitle></CardHeader><CardContent><Badge variant='default'>Compliant</Badge></CardContent></Card>
        <Card><CardHeader><CardTitle>GDPR</CardTitle></CardHeader><CardContent><Badge variant='default'>Compliant</Badge></CardContent></Card>
        <Card><CardHeader><CardTitle>SOC 2</CardTitle></CardHeader><CardContent><Badge variant='secondary'>In Progress</Badge></CardContent></Card>
      </div>
    </div>
  );
}