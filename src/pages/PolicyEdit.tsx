import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PolicyEdit() {
  const { id } = useParams();
  return <DashboardLayout><Card><CardHeader><CardTitle>Edit Policy {id}</CardTitle></CardHeader><CardContent><p>Edit policy settings.</p></CardContent></Card></DashboardLayout>;
}