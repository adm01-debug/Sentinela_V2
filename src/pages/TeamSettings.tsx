import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeamSettings() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Team Settings</CardTitle></CardHeader><CardContent><p>Configure team settings.</p></CardContent></Card></DashboardLayout>;
}