import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');
  const { data } = useAnalytics({ period });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">Últimos 7 dias</SelectItem><SelectItem value="30d">Últimos 30 dias</SelectItem><SelectItem value="90d">Últimos 90 dias</SelectItem></SelectContent></Select>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /><span className="text-sm text-muted-foreground">Produtividade</span></div><p className="text-2xl font-bold mt-2">{data?.productivity}%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /><span className="text-sm text-muted-foreground">Horas Ativas</span></div><p className="text-2xl font-bold mt-2">{data?.activeHours}h</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-purple-500" /><span className="text-sm text-muted-foreground">Usuários Ativos</span></div><p className="text-2xl font-bold mt-2">{data?.activeUsers}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-orange-500" /><span className="text-sm text-muted-foreground">Apps Usados</span></div><p className="text-2xl font-bold mt-2">{data?.appsUsed}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Produtividade ao longo do tempo</CardTitle></CardHeader><CardContent><div className="h-80"><ResponsiveContainer><AreaChart data={data?.chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Area type="monotone" dataKey="productivity" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} /></AreaChart></ResponsiveContainer></div></CardContent></Card>
    </div>
  );
}