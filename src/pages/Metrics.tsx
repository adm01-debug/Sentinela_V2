import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Metrics() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Metrics</CardTitle></CardHeader><CardContent><div className='h-96 bg-gray-100 rounded flex items-center justify-center'>Charts</div></CardContent></Card></DashboardLayout>;
}