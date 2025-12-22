import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Geofences() {
  return <DashboardLayout><Card><CardHeader className='flex flex-row items-center justify-between'><CardTitle>Geofences</CardTitle><Button>Add Geofence</Button></CardHeader><CardContent><p>Manage your geofences.</p></CardContent></Card></DashboardLayout>;
}