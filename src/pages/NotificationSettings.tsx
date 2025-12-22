import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export default function NotificationSettings() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader><CardContent><div className='space-y-4'><div className='flex items-center justify-between'><span>Email Notifications</span><Switch /></div><div className='flex items-center justify-between'><span>Push Notifications</span><Switch /></div></div></CardContent></Card></DashboardLayout>;
}