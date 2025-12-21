import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Maintenance() {
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Maintenance Mode</h1>
      <Alert><AlertTitle>System Status</AlertTitle><AlertDescription>All systems operational</AlertDescription></Alert>
      <Button className='mt-4' variant='destructive'>Enable Maintenance Mode</Button>
    </div>
  );
}