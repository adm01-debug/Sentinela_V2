import { Card, CardHeader, CardTitle, CardContent  } from '@/components/ui/card';
import { Badge  } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTrendsAnalytics } from '@/hooks/useAnalytics';

export default function AnalyticsTrendsPage() {
  const { data } = useTrendsAnalytics();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tendências</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {data?.insights?.map((insight, i) => (
          <Card key={i}><CardContent className="pt-6"><div className="flex items-center gap-2">{insight.trend === 'up' ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}<span className="font-medium">{insight.title}</span></div><p className="text-2xl font-bold mt-2">{insight.value}</p><p className="text-sm text-muted-foreground">{insight.description}</p></CardContent></Card>
        ))}
      </div>
      <Card><CardHeader><CardTitle>Evolução Mensal</CardTitle></CardHeader><CardContent><div className="h-80"><ResponsiveContainer><LineChart data={data?.monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="productivity" stroke="#8884d8" name="Produtividade" /><Line type="monotone" dataKey="activeHours" stroke="#82ca9d" name="Horas Ativas" /></LineChart></ResponsiveContainer></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Previsões</CardTitle></CardHeader><CardContent className="space-y-4">{data?.predictions?.map((pred, i) => <div key={i} className="flex items-center justify-between p-4 border rounded-lg"><div><p className="font-medium">{pred.metric}</p><p className="text-sm text-muted-foreground">Baseado nos últimos 30 dias</p></div><div className="flex items-center gap-2"><span className="text-muted-foreground">{pred.current}</span><ArrowRight className="h-4 w-4" /><span className="font-bold text-lg">{pred.predicted}</span><Badge variant={pred.change > 0 ? 'default' : 'secondary'}>{pred.change > 0 ? '+' : ''}{pred.change}%</Badge></div></div>)}</CardContent></Card>
    </div>
  );
}