import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Notifications() {
  const notifications = [{ title: 'New violation detected', time: '5 min ago', read: false }];
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Notifications</h1>
      {notifications.map((n, i) => <Card key={i} className='mb-2'><CardHeader><CardTitle className='flex items-center gap-2'>{n.title}{!n.read && <Badge>New</Badge>}</CardTitle></CardHeader><CardContent>{n.time}</CardContent></Card>)}
    </div>
  );
}