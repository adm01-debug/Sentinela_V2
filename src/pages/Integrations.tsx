import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Integrations() {
  const integrations = ['Slack', 'Teams', 'Jira', 'Discord'];
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Integrations</h1>
      <div className='grid gap-4 md:grid-cols-2'>
        {integrations.map(i => <Card key={i}><CardHeader><CardTitle>{i}</CardTitle></CardHeader><CardContent><Button variant='outline'>Configure</Button></CardContent></Card>)}
      </div>
    </div>
  );
}