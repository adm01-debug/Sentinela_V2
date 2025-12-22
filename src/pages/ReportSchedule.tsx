import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportSchedule() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Schedule Report</CardTitle></CardHeader><CardContent><p className='mb-4'>Schedule automatic report delivery.</p><Button>Create Schedule</Button></CardContent></Card></DashboardLayout>;
}