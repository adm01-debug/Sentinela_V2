import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Activities() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader><CardTitle>Activities</CardTitle></CardHeader>
        <CardContent><p>View all employee activities.</p></CardContent>
      </Card>
    </DashboardLayout>
  );
}