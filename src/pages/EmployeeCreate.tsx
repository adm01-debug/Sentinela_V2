import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EmployeeCreate() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader><CardTitle>Create Employee</CardTitle></CardHeader>
        <CardContent>
          <form className='space-y-4'>
            <div><Label>Name</Label><Input placeholder='Full name' /></div>
            <div><Label>Email</Label><Input type='email' placeholder='email@example.com' /></div>
            <div><Label>Department</Label><Input placeholder='Department' /></div>
            <Button type='submit'>Create Employee</Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}