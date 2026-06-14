import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Brain, RefreshCw, Settings, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';
import { RiskScoreBadge } from '@/components/ueba/RiskScoreBadge';
import { useTopRiskyUsers } from '@/hooks/useRiskScores';
import { supabase } from '@/integrations/supabase/client';
import { useChartColors } from '@/hooks/useChartColors';
import { getLevelMeta, RISK_LEVEL_ORDER, type RiskLevel } from '@/lib/uebaLevels';

export const UEBADashboardPage = () => {
  const navigate = useNavigate();
  const colors = useChartColors();
  const { users, loading } = useTopRiskyUsers(10);
  const [recalculating, setRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const { error } = await supabase.functions.invoke('risk-score-calculator', {
        body: { period: '24h' },
      });
      if (error) throw error;
      toast.success('Risk scores recalculated');
    } catch (e) {
      toast.error('Failed to recalculate', { description: e instanceof Error ? e.message : 'Unknown' });
    } finally {
      setRecalculating(false);
    }
  };

  const distribution = RISK_LEVEL_ORDER.map((lvl) => ({
    level: lvl,
    label: getLevelMeta(lvl).label,
    count: users.filter((u) => u.level === lvl).length,
  }));

  const levelColor = (lvl: RiskLevel) => ({
    low: colors.success,
    medium: colors.warning,
    high: '#f97316',
    critical: colors.destructive,
  })[lvl];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              UEBA — Análise Comportamental
            </h1>
            <p className="text-sm text-muted-foreground">
              Detecção de anomalias com Half-Space Trees + Z-score multi-feature
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRecalculate} disabled={recalculating} variant="outline" size="sm" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
              Recalcular
            </Button>
            <Button onClick={() => navigate('/admin/ueba/settings')} variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {RISK_LEVEL_ORDER.map((lvl) => {
            const meta = getLevelMeta(lvl);
            const count = users.filter((u) => u.level === lvl).length;
            return (
              <Card key={lvl} className={`border-l-4 ${meta.borderClass}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Risco {meta.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${meta.colorClass}`}>{count}</div>
                  <p className="text-xs text-muted-foreground mt-1">funcionários</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Top 10 Funcionários de Maior Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground py-8 text-center">Carregando...</div>
              ) : users.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nenhum risk score calculado ainda. Clique em &quot;Recalcular&quot; para começar.
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((u, i) => (
                    <button
                      key={u.id}
                      onClick={() => navigate(`/admin/ueba/${u.employee_id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                        <span className="text-sm font-medium">{u.employee_name || 'Unknown'}</span>
                      </div>
                      <RiskScoreBadge score={u.score} level={u.level} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Distribuição por Nível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="label" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} />
                    <YAxis tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {distribution.map((d) => (
                        <Cell key={d.level} fill={levelColor(d.level)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default UEBADashboardPage;
