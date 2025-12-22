import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeamDetail() {
  const { id } = useParams();
  return <DashboardLayout><Card><CardHeader><CardTitle>Team Details</CardTitle></CardHeader><CardContent><p>Team ID: {id}</p></CardContent></Card></DashboardLayout>;
}