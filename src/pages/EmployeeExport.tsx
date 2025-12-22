import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EmployeeExport() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader><CardTitle>Export Employees</CardTitle></CardHeader>
        <CardContent>
          <p className='mb-4'>Export employee data to CSV or Excel format.</p>
          <div className='space-x-2'>
            <Button>Export CSV</Button>
            <Button variant='outline'>Export Excel</Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}