import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EmployeeImport() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader><CardTitle>Import Employees</CardTitle></CardHeader>
        <CardContent>
          <p className='mb-4'>Upload a CSV file to import employees.</p>
          <input type='file' accept='.csv,.xlsx' className='mb-4' />
          <Button>Start Import</Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}