import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Timeline() {
  const events = [{ time: '09:00', title: 'Login', desc: 'User logged in' }, { time: '10:30', title: 'Report', desc: 'Generated report' }];
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Activity Timeline</h1>
      <div className='space-y-4'>
        {events.map((e, i) => <Card key={i}><CardHeader><CardTitle className='text-sm'>{e.time} - {e.title}</CardTitle></CardHeader><CardContent>{e.desc}</CardContent></Card>)}
      </div>
    </div>
  );
}