import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function IntegrationSetup() {
  const { provider } = useParams();
  return <DashboardLayout><Card><CardHeader><CardTitle>Setup {provider}</CardTitle></CardHeader><CardContent><p>Configure your {provider} integration.</p></CardContent></Card></DashboardLayout>;
}