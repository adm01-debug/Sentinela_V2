import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  BarChart3,
  Users,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface PeriodData {
  label: string;
  startDate: Date;
  endDate: Date;
  productiveHours: number;
  unproductiveHours: number;
  neutralHours: number;
  totalHours: number;
  productivityRate: number;
  violationsCount: number;
  keystrokesCount: number;
  employeesActive: number;
  topApps: { name: string; hours: number }[];
}

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '14d', label: 'Últimos 14 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: 'month', label: 'Este mês' },
  { value: 'lastMonth', label: 'Mês anterior' },
];

const COLORS = ['hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

export default function ProductivityComparison() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period1, setPeriod1] = useState('7d');
  const [period2, setPeriod2] = useState('14d');
  const [data1, setData1] = useState<PeriodData | null>(null);
  const [data2, setData2] = useState<PeriodData | null>(null);

  const getPeriodDates = (period: string): { start: Date; end: Date; label: string } => {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);
    let label = '';

    switch (period) {
      case '7d':
        start.setDate(start.getDate() - 7);
        label = 'Últimos 7 dias';
        break;
      case '14d':
        start.setDate(start.getDate() - 14);
        label = 'Últimos 14 dias';
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        label = 'Últimos 30 dias';
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        label = 'Este mês';
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end.setDate(0);
        label = 'Mês anterior';
        break;
      default:
        start.setDate(start.getDate() - 7);
        label = 'Últimos 7 dias';
    }

    return { start, end, label };
  };

  const fetchPeriodData = async (period: string): Promise<PeriodData> => {
    const { start, end, label } = getPeriodDates(period);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const [productivityRes, violationsRes, keystrokesRes] = await Promise.all([
      supabase
        .from('productivity_logs')
        .select('*')
        .gte('recorded_date', startStr)
        .lte('recorded_date', endStr),
      supabase
        .from('security_violations')
        .select('id')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString()),
      supabase
        .from('keystroke_logs')
        .select('employee_name, keystrokes_count')
        .gte('recorded_at', start.toISOString())
        .lte('recorded_at', end.toISOString())
    ]);

    const productivity = productivityRes.data || [];
    const violations = violationsRes.data || [];
    const keystrokes = keystrokesRes.data || [];

    const productiveSeconds = productivity.reduce((acc, p) => acc + (p.productive_time_seconds || 0), 0);
    const unproductiveSeconds = productivity.reduce((acc, p) => acc + (p.unproductive_time_seconds || 0), 0);
    const neutralSeconds = productivity.reduce((acc, p) => acc + (p.neutral_time_seconds || 0), 0);
    const totalSeconds = productiveSeconds + unproductiveSeconds + neutralSeconds;

    const uniqueEmployees = new Set(productivity.map(p => p.employee_name));
    const totalKeystrokes = keystrokes.reduce((acc, k) => acc + (k.keystrokes_count || 0), 0);

    // Aggregate apps used
    const appsMap = new Map<string, number>();
    productivity.forEach(p => {
      const apps = p.apps_used as any[];
      if (Array.isArray(apps)) {
        apps.forEach((app: any) => {
          if (app?.name) {
            appsMap.set(app.name, (appsMap.get(app.name) || 0) + (app.time || 0));
          }
        });
      }
    });

    const topApps = Array.from(appsMap.entries())
      .map(([name, seconds]) => ({ name, hours: Math.round(seconds / 3600 * 10) / 10 }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    return {
      label,
      startDate: start,
      endDate: end,
      productiveHours: Math.round(productiveSeconds / 3600 * 10) / 10,
      unproductiveHours: Math.round(unproductiveSeconds / 3600 * 10) / 10,
      neutralHours: Math.round(neutralSeconds / 3600 * 10) / 10,
      totalHours: Math.round(totalSeconds / 3600 * 10) / 10,
      productivityRate: totalSeconds > 0 ? Math.round((productiveSeconds / totalSeconds) * 100) : 0,
      violationsCount: violations.length,
      keystrokesCount: totalKeystrokes,
      employeesActive: uniqueEmployees.size,
      topApps
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [d1, d2] = await Promise.all([
        fetchPeriodData(period1),
        fetchPeriodData(period2)
      ]);
      setData1(d1);
      setData2(d2);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period1, period2]);

  const comparisonData = useMemo(() => {
    if (!data1 || !data2) return null;

    return {
      productivity: [
        { name: data1.label, value: data1.productivityRate },
        { name: data2.label, value: data2.productivityRate }
      ],
      hours: [
        { 
          name: 'Horas', 
          [data1.label]: data1.totalHours, 
          [data2.label]: data2.totalHours 
        }
      ],
      breakdown: [
        { 
          category: 'Produtivo', 
          [data1.label]: data1.productiveHours, 
          [data2.label]: data2.productiveHours 
        },
        { 
          category: 'Improdutivo', 
          [data1.label]: data1.unproductiveHours, 
          [data2.label]: data2.unproductiveHours 
        },
        { 
          category: 'Neutro', 
          [data1.label]: data1.neutralHours, 
          [data2.label]: data2.neutralHours 
        }
      ],
      metrics: [
        { 
          category: 'Violações', 
          [data1.label]: data1.violationsCount, 
          [data2.label]: data2.violationsCount 
        },
        { 
          category: 'Funcionários', 
          [data1.label]: data1.employeesActive, 
          [data2.label]: data2.employeesActive 
        }
      ]
    };
  }, [data1, data2]);

  const getChangeIndicator = (val1: number, val2: number, inverse = false) => {
    const diff = val1 - val2;
    const pct = val2 !== 0 ? Math.round((diff / val2) * 100) : 0;
    const isPositive = inverse ? diff < 0 : diff > 0;
    
    if (diff === 0) return { icon: Minus, color: 'text-muted-foreground', text: 'Igual', pct: 0 };
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-success' : 'text-destructive',
      text: isPositive ? 'Melhor' : 'Pior',
      pct: Math.abs(pct)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Comparativo de Produtividade
            </h1>
            <p className="text-sm text-muted-foreground">Compare métricas entre diferentes períodos</p>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Period Selectors */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-primary bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">Período 1</span>
            </div>
            <Select value={period1} onValueChange={setPeriod1}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-xl border border-secondary bg-secondary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-secondary-foreground" />
              <span className="font-medium">Período 2</span>
            </div>
            <Select value={period2} onValueChange={setPeriod2}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {data1 && data2 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Taxa de Produtividade', 
                  val1: data1.productivityRate, 
                  val2: data2.productivityRate, 
                  suffix: '%',
                  icon: TrendingUp
                },
                { 
                  label: 'Horas Totais', 
                  val1: data1.totalHours, 
                  val2: data2.totalHours, 
                  suffix: 'h',
                  icon: Clock
                },
                { 
                  label: 'Violações', 
                  val1: data1.violationsCount, 
                  val2: data2.violationsCount, 
                  suffix: '',
                  icon: TrendingDown,
                  inverse: true
                },
                { 
                  label: 'Funcionários Ativos', 
                  val1: data1.employeesActive, 
                  val2: data2.employeesActive, 
                  suffix: '',
                  icon: Users
                }
              ].map((metric, idx) => {
                const change = getChangeIndicator(metric.val1, metric.val2, metric.inverse);
                return (
                  <div key={idx} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <metric.icon className="h-4 w-4" />
                      <span className="text-sm">{metric.label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold">{metric.val1}{metric.suffix}</p>
                        <p className="text-sm text-muted-foreground">vs {metric.val2}{metric.suffix}</p>
                      </div>
                      <div className={`flex items-center gap-1 ${change.color}`}>
                        <change.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{change.pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Productivity Rate Comparison */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Taxa de Produtividade</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData?.productivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Produtividade']}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Time Breakdown */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Distribuição de Tempo</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData?.breakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis dataKey="category" type="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}h`, '']}
                      />
                      <Legend />
                      <Bar dataKey={data1.label} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey={data2.label} fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Comparison */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Period 1 Details */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Badge className="bg-primary">{data1.label}</Badge>
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-success/10">
                      <p className="text-2xl font-bold text-success">{data1.productiveHours}h</p>
                      <p className="text-xs text-muted-foreground">Produtivo</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-destructive/10">
                      <p className="text-2xl font-bold text-destructive">{data1.unproductiveHours}h</p>
                      <p className="text-xs text-muted-foreground">Improdutivo</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <p className="text-2xl font-bold">{data1.neutralHours}h</p>
                      <p className="text-xs text-muted-foreground">Neutro</p>
                    </div>
                  </div>
                  {data1.topApps.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Top Aplicativos</p>
                      <div className="space-y-1">
                        {data1.topApps.map((app, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{app.name}</span>
                            <span className="font-medium">{app.hours}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Period 2 Details */}
              <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Badge variant="secondary">{data2.label}</Badge>
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-success/10">
                      <p className="text-2xl font-bold text-success">{data2.productiveHours}h</p>
                      <p className="text-xs text-muted-foreground">Produtivo</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-destructive/10">
                      <p className="text-2xl font-bold text-destructive">{data2.unproductiveHours}h</p>
                      <p className="text-xs text-muted-foreground">Improdutivo</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <p className="text-2xl font-bold">{data2.neutralHours}h</p>
                      <p className="text-xs text-muted-foreground">Neutro</p>
                    </div>
                  </div>
                  {data2.topApps.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Top Aplicativos</p>
                      <div className="space-y-1">
                        {data2.topApps.map((app, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{app.name}</span>
                            <span className="font-medium">{app.hours}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Change Summary */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Resumo das Mudanças</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Produtividade', val1: data1.productivityRate, val2: data2.productivityRate, unit: '%' },
                  { label: 'Horas Totais', val1: data1.totalHours, val2: data2.totalHours, unit: 'h' },
                  { label: 'Violações', val1: data1.violationsCount, val2: data2.violationsCount, unit: '', inverse: true },
                  { label: 'Teclas Digitadas', val1: data1.keystrokesCount, val2: data2.keystrokesCount, unit: '' }
                ].map((item, idx) => {
                  const diff = item.val1 - item.val2;
                  const isPositive = item.inverse ? diff < 0 : diff > 0;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      {isPositive ? (
                        <ArrowUpRight className="h-5 w-5 text-success" />
                      ) : diff < 0 ? (
                        <ArrowDownRight className="h-5 w-5 text-destructive" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className={`font-semibold ${isPositive ? 'text-success' : diff < 0 ? 'text-destructive' : ''}`}>
                          {diff > 0 ? '+' : ''}{diff.toLocaleString()}{item.unit}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
