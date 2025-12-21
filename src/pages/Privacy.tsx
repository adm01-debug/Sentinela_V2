import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  return (
    <div className='container mx-auto p-6 max-w-xl'>
      <h1 className='text-2xl font-bold mb-6'>Privacy Settings</h1>
      <div className='space-y-4'>
        <div className='flex items-center gap-4'><Switch defaultChecked /><Label>Data collection</Label></div>
        <div className='flex items-center gap-4'><Switch /><Label>Share analytics</Label></div>
        <Button variant='destructive'>Delete All My Data</Button>
      </div>
    </div>
  );
}