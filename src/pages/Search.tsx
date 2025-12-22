import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function Search() {
  const [query, setQuery] = useState('');
  return <DashboardLayout><Card><CardHeader><CardTitle>Search</CardTitle></CardHeader><CardContent><Input value={query} onChange={e => setQuery(e.target.value)} placeholder='Search employees, activities...' className='mb-4' /><p>Results for: {query || 'Enter a search term'}</p></CardContent></Card></DashboardLayout>;
}