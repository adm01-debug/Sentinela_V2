import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ResetPassword() {
  return <div className='min-h-screen flex items-center justify-center bg-gray-50'><Card className='w-full max-w-md'><CardHeader><CardTitle>Reset Password</CardTitle></CardHeader><CardContent><form className='space-y-4'><Input type='password' placeholder='New password' /><Input type='password' placeholder='Confirm password' /><Button className='w-full'>Reset Password</Button></form></CardContent></Card></div>;
}