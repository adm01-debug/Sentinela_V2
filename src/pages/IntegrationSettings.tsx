import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function IntegrationSettings() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Integration Settings</CardTitle></CardHeader><CardContent><p>Configure your integrations.</p></CardContent></Card></DashboardLayout>;
}