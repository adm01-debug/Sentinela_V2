import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ScreenshotDetail() {
  const { id } = useParams();
  return <DashboardLayout><Card><CardHeader><CardTitle>Screenshot Detail</CardTitle></CardHeader><CardContent><div className='bg-gray-100 h-96 rounded flex items-center justify-center'>Screenshot {id}</div></CardContent></Card></DashboardLayout>;
}