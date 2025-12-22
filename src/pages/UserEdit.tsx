import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserEdit() {
  const { id } = useParams();
  return <DashboardLayout><Card><CardHeader><CardTitle>Edit User {id}</CardTitle></CardHeader><CardContent><p>Edit user.</p></CardContent></Card></DashboardLayout>;
}