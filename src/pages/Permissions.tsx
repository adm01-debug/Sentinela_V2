import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Permissions() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Permissions</CardTitle></CardHeader><CardContent><p>Manage user permissions and access control.</p></CardContent></Card></DashboardLayout>;
}