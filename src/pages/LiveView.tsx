import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LiveView() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Live View</CardTitle></CardHeader><CardContent><div className='grid gap-4 md:grid-cols-3'><div className='h-48 bg-gray-100 rounded'>Screen 1</div><div className='h-48 bg-gray-100 rounded'>Screen 2</div><div className='h-48 bg-gray-100 rounded'>Screen 3</div></div></CardContent></Card></DashboardLayout>;
}