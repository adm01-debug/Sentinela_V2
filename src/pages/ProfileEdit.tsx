import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfileEdit() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader><CardContent><form className='space-y-4'><Input placeholder='Name' /><Input type='email' placeholder='Email' /><Button>Save Changes</Button></form></CardContent></Card></DashboardLayout>;
}