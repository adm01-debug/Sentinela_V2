import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ActivityDetail() {
  const { id } = useParams();
  return (
    <DashboardLayout>
      <Card>
        <CardHeader><CardTitle>Activity Detail</CardTitle></CardHeader>
        <CardContent><p>Activity ID: {id}</p></CardContent>
      </Card>
    </DashboardLayout>
  );
}