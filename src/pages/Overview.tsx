import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Overview() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Overview</CardTitle></CardHeader><CardContent><p>System overview and quick stats.</p></CardContent></Card></DashboardLayout>;
}