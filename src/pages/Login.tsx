import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  return <div className='min-h-screen flex items-center justify-center bg-gray-50'><Card className='w-full max-w-md'><CardHeader><CardTitle>Login</CardTitle></CardHeader><CardContent><form className='space-y-4'><Input type='email' placeholder='Email' /><Input type='password' placeholder='Password' /><Button className='w-full'>Sign In</Button></form></CardContent></Card></div>;
}