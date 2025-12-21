import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Analytics() {
  const { data } = useQuery({ queryKey: ['analytics'], queryFn: async () => ({ views: 1000, users: 500 }) });
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Analytics</h1>
      <div className='grid gap-4 md:grid-cols-2'>
        <Card><CardHeader><CardTitle>Page Views</CardTitle></CardHeader><CardContent>{data?.views}</CardContent></Card>
        <Card><CardHeader><CardTitle>Users</CardTitle></CardHeader><CardContent>{data?.users}</CardContent></Card>
      </div>
    </div>
  );
}