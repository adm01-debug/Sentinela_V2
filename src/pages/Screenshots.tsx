import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Screenshots() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Screenshots</CardTitle></CardHeader><CardContent><div className='grid gap-4 md:grid-cols-3'><div className='h-32 bg-gray-100 rounded'></div><div className='h-32 bg-gray-100 rounded'></div><div className='h-32 bg-gray-100 rounded'></div></div></CardContent></Card></DashboardLayout>;
}