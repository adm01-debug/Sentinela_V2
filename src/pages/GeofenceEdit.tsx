import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GeofenceEdit() {
  const { id } = useParams();
  return <DashboardLayout><Card><CardHeader><CardTitle>Edit Geofence {id}</CardTitle></CardHeader><CardContent><p>Edit geofence settings.</p></CardContent></Card></DashboardLayout>;
}