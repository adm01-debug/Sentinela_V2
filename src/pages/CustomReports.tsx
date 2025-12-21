import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CustomReports() {
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Custom Reports</h1>
      <div className='space-y-4'>
        <Input placeholder='Report name' />
        <Button>Create Report</Button>
      </div>
    </div>
  );
}