import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoleDetail() {
  const { id } = useParams();
  return <DashboardLayout><Card><CardHeader><CardTitle>Role Details</CardTitle></CardHeader><CardContent><p>Role ID: {id}</p></CardContent></Card></DashboardLayout>;
}