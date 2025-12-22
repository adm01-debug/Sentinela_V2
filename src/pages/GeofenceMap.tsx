import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GeofenceMap() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Geofence Map</CardTitle></CardHeader><CardContent><div className='h-96 bg-gray-100 rounded flex items-center justify-center'>Map View</div></CardContent></Card></DashboardLayout>;
}