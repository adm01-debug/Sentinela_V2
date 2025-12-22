import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserDetail() {
  const { id } = useParams();
  return <DashboardLayout><Card><CardHeader><CardTitle>User {id}</CardTitle></CardHeader><CardContent><p>User details.</p></CardContent></Card></DashboardLayout>;
}