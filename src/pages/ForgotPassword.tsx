import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPassword() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <Card className='w-full max-w-md'>
        <CardHeader><CardTitle>Reset Password</CardTitle></CardHeader>
        <CardContent>
          <form className='space-y-4'>
            <Input type='email' placeholder='Enter your email' />
            <Button className='w-full'>Send Reset Link</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}