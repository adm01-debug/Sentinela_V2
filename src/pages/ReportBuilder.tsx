import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportBuilder() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Report Builder</CardTitle></CardHeader><CardContent><p className='mb-4'>Build custom reports with drag and drop.</p><Button>Create Report</Button></CardContent></Card></DashboardLayout>;
}