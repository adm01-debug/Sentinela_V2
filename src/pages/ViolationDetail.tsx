import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ViolationDetail() {
  const { id } = useParams();
  return <DashboardLayout><Card><CardHeader><CardTitle>Violation {id}</CardTitle></CardHeader><CardContent><p>Details.</p></CardContent></Card></DashboardLayout>;
}