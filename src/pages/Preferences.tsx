import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Preferences() {
  return (
    <div className='container mx-auto p-6 max-w-xl'>
      <h1 className='text-2xl font-bold mb-6'>Preferences</h1>
      <div className='space-y-4'>
        <div className='flex items-center gap-4'><Switch defaultChecked /><Label>Email notifications</Label></div>
        <div className='flex items-center gap-4'><Switch /><Label>SMS notifications</Label></div>
        <div className='flex items-center gap-4'><Switch defaultChecked /><Label>Weekly reports</Label></div>
      </div>
    </div>
  );
}