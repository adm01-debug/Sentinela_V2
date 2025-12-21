import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Billing() {
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Billing</h1>
      <Card><CardHeader><CardTitle>Current Plan</CardTitle></CardHeader><CardContent>Pro - $99/month</CardContent></Card>
      <Button className='mt-4'>Upgrade Plan</Button>
    </div>
  );
}