import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function SecuritySettings() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Security Settings</CardTitle></CardHeader><CardContent><div className='space-y-4'><div className='flex items-center justify-between'><span>Two-Factor Authentication</span><Switch /></div><div className='flex items-center justify-between'><span>Session Timeout</span><Switch /></div><Button>Save Settings</Button></div></CardContent></Card></DashboardLayout>;
}