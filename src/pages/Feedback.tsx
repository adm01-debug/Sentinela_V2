import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function Feedback() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader><CardTitle>Send Feedback</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder='Tell us what you think...' className='mb-4' />
          <Button>Submit Feedback</Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}