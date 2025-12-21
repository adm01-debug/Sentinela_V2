import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Profile() {
  return (
    <div className='container mx-auto p-6 max-w-xl'>
      <h1 className='text-2xl font-bold mb-6'>My Profile</h1>
      <div className='flex items-center gap-4 mb-6'><Avatar className='w-20 h-20'><AvatarImage src='' /><AvatarFallback>JD</AvatarFallback></Avatar><Button variant='outline'>Change Photo</Button></div>
      <div className='space-y-4'>
        <div><Label>Name</Label><Input defaultValue='John Doe' /></div>
        <div><Label>Email</Label><Input defaultValue='john@example.com' /></div>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}