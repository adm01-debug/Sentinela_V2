import { useMemo } from 'react';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompliance } from '@/hooks/useCompliance';
import { useChartColors } from '@/hooks/useChartColors';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function CompliancePage() {
  const { rules, checking, compliancePercentage } = useCompliance();
  const compliant = rules.filter(i => i.status === 'compliant').length;
  const colors = useChartColors();

  // Status pie
  const statusData = useMemo(() => [
    { name: 'Conforme', value: rules.filter(r => r.status === 'compliant').length, color: colors.success },
    { name: 'Parcial', value: rules.filter(r => r.status !== 'compliant').length, color: colors.warning },
  ].filter(d => d.value > 0), [rules, colors]);

  // By category bar
  const categoryData = useMemo(() => {
    const catMap: Record<string, { compliant: number; total: number }> = {};
    rules.forEach(r => {
      const cat = r.category || 'Geral';
      if (!catMap[cat]) catMap[cat] = { compliant: 0, total: 0 };
      catMap[cat].total++;
      if (r.status === 'compliant') catMap[cat].compliant++;
    });
    return Object.entries(catMap).map(([name, { compliant, total }]) => ({
      name,
      conformidade: total > 0 ? Math.round((compliant / total) * 100) : 0,
    }));
  }, [rules]);

  if (checking) return <div className="p-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />Compliance</h1><p className="text-muted-foreground mt-1">Status de conformidade e políticas</p></div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-2"><span className="font-medium">Conformidade Geral</span><span className="font-bold">{compliancePercentage}%</span></div>
              <Progress value={compliancePercentage} className="h-3" />
            </div>
            <div className="text-center"><p className="text-3xl font-bold text-success">{compliant}/{rules.length}</p><p className="text-xs text-muted-foreground">Itens conformes</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Visão Geral</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4">
              {statusData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Conformidade por Categoria</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 10 }} stroke={colors.border} />
                  <YAxis domain={[0, 100]} tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="conformidade" name="Conformidade %" fill={colors.success} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {rules.map((item, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-4">
              {item.status === 'compliant' ? <CheckCircle className="h-5 w-5 text-success shrink-0" /> : <AlertTriangle className="h-5 w-5 text-warning shrink-0" />}
              <div className="flex-1">
                <div className="flex items-center gap-2"><p className="font-medium">{item.name}</p><Badge variant="outline">{item.category}</Badge></div>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
              <Badge variant={item.status === 'compliant' ? 'default' : 'secondary'}>{item.status === 'compliant' ? 'Conforme' : 'Parcial'}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { CompliancePage };
