import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TwoFactorAuth() {
  return <div className='min-h-screen flex items-center justify-center'><Card className='w-full max-w-md'><CardHeader><CardTitle>2FA</CardTitle></CardHeader><CardContent><Input placeholder='Code' /><Button className='w-full mt-4'>Verify</Button></CardContent></Card></div>;
}