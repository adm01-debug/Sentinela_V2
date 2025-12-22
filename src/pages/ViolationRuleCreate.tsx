import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ViolationRuleCreate() {
  return <DashboardLayout><Card><CardHeader><CardTitle>Create Rule</CardTitle></CardHeader><CardContent><Button>Create</Button></CardContent></Card></DashboardLayout>;
}