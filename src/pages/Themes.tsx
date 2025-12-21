import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Themes() {
  const themes = ['Light', 'Dark', 'System'];
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Themes</h1>
      <div className='grid gap-4 md:grid-cols-3'>
        {themes.map(t => <Card key={t}><CardHeader><CardTitle>{t}</CardTitle></CardHeader><CardContent><Button variant='outline'>Apply</Button></CardContent></Card>)}
      </div>
    </div>
  );
}