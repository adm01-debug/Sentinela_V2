import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Backup() {
  const [lastBackup] = useState(new Date().toISOString());
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Backup Management</h1>
      <Card><CardHeader><CardTitle>Last Backup</CardTitle></CardHeader><CardContent>{lastBackup}</CardContent></Card>
      <Button className='mt-4'>Create Backup</Button>
    </div>
  );
}