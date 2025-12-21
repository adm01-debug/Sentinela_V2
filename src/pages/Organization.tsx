import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Organization() {
  return (
    <div className='container mx-auto p-6 max-w-xl'>
      <h1 className='text-2xl font-bold mb-6'>Organization Settings</h1>
      <div className='space-y-4'>
        <div><Label>Organization Name</Label><Input defaultValue='Acme Corp' /></div>
        <div><Label>Domain</Label><Input defaultValue='acme.com' /></div>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}