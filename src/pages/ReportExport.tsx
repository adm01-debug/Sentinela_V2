import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportExport() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Export Report</CardTitle></CardHeader><CardContent><div className='space-x-2'><Button>Export PDF</Button><Button variant='outline'>Export Excel</Button></div></CardContent></Card></DashboardLayout>;
}