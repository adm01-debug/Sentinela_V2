import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BillingSettings() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader><CardTitle>Billing Settings</CardTitle></CardHeader>
        <CardContent>
          <p>Manage your billing information and subscription.</p>
          <Button className='mt-4'>Update Payment Method</Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}