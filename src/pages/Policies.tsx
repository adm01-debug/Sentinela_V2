import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Policies() {
  return <DashboardLayout><Card><CardHeader className='flex flex-row items-center justify-between'><CardTitle>Monitoring Policies</CardTitle><Button>Create Policy</Button></CardHeader><CardContent><p>Manage monitoring policies.</p></CardContent></Card></DashboardLayout>;
}