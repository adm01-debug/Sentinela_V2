import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TeamCreate() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Create Team</CardTitle></CardHeader><CardContent><form className='space-y-4'><Input placeholder='Team name' /><Input placeholder='Description' /><Button>Create Team</Button></form></CardContent></Card></DashboardLayout>;
}