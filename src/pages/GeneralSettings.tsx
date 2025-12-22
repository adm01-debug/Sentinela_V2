import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function GeneralSettings() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div><Label>Company Name</Label><Input defaultValue='My Company' /></div>
            <div><Label>Timezone</Label><Input defaultValue='America/Sao_Paulo' /></div>
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}