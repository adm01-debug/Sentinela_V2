import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Users() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Users</CardTitle></CardHeader><CardContent><p>Manage users.</p></CardContent></Card></DashboardLayout>;
}