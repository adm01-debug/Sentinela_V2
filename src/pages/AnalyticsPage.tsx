import { PageTransition } from '@/components/PageTransition';
import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');
  const { data } = useAnalytics({ period });

  return (<PageTransition>
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">Últimos 7 dias</SelectItem><SelectItem value="30d">Últimos 30 dias</SelectItem><SelectItem value="90d">Últimos 90 dias</SelectItem></SelectContent></Select>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success" /><span className="text-sm text-muted-foreground">Produtividade</span></div><p className="text-2xl font-bold mt-2">{data?.productivity || 0}%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-info" /><span className="text-sm text-muted-foreground">Horas Ativas</span></div><p className="text-2xl font-bold mt-2">{data?.activeHours || 0}h</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-accent-foreground" /><span className="text-sm text-muted-foreground">Usuários Ativos</span></div><p className="text-2xl font-bold mt-2">{data?.activeUsers || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-warning" /><span className="text-sm text-muted-foreground">Apps Usados</span></div><p className="text-2xl font-bold mt-2">{data?.appsUsed || 0}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Produtividade ao longo do tempo</CardTitle></CardHeader><CardContent><div className="h-80"><ResponsiveContainer><AreaChart data={data?.chartData || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Area type="monotone" dataKey="productivity" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} /></AreaChart></ResponsiveContainer></div></CardContent></Card>
    </div>
  </PageTransition>);
}
