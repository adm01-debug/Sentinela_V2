import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RoleCreate() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Create Role</CardTitle></CardHeader><CardContent><form className='space-y-4'><Input placeholder='Role name' /><Input placeholder='Description' /><Button>Create Role</Button></form></CardContent></Card></DashboardLayout>;
}