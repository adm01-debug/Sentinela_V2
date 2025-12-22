import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RoleEdit() {
  const { id } = useParams();
  return <DashboardLayout><Card><CardHeader><CardTitle>Edit Role {id}</CardTitle></CardHeader><CardContent><Button>Save Changes</Button></CardContent></Card></DashboardLayout>;
}