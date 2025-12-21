import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Support() {
  return (
    <div className='container mx-auto p-6 max-w-xl'>
      <h1 className='text-2xl font-bold mb-6'>Support</h1>
      <div className='space-y-4'>
        <div><Label>Subject</Label><Input placeholder='How can we help?' /></div>
        <div><Label>Message</Label><Textarea placeholder='Describe your issue...' /></div>
        <Button>Submit Ticket</Button>
      </div>
    </div>
  );
}