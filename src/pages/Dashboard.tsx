import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card><CardHeader><CardTitle>Total Employees</CardTitle></CardHeader><CardContent><p className='text-3xl font-bold'>245</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Active Now</CardTitle></CardHeader><CardContent><p className='text-3xl font-bold'>128</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Violations Today</CardTitle></CardHeader><CardContent><p className='text-3xl font-bold'>12</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Productivity</CardTitle></CardHeader><CardContent><p className='text-3xl font-bold'>87%</p></CardContent></Card>
      </div>
    </DashboardLayout>
  );
}