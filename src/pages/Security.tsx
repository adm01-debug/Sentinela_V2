import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSecurityMetrics } from '@/hooks/useSecurityMetrics';
import { useSecurityViolations } from '@/hooks/useSecurityViolations';
import { useSettings } from '@/hooks/useSettings';

export default function Security() {
  const navigate = useNavigate();
  const { metrics, loading: metricsLoading } = useSecurityMetrics();
  const { violations, loading: violationsLoading } = useSecurityViolations();
  const { policies, loading: policiesLoading } = useSettings();

  const loading = metricsLoading || violationsLoading || policiesLoading;

  // Calcular score de segurança (0-100)
  const enabledPolicies = policies.filter(p => p.enabled).length;
  const totalPolicies = policies.length;
  const policyScore = totalPolicies > 0 ? Math.round((enabledPolicies / totalPolicies) * 100) : 0;
  
  // Score baseado em violações (menos violações = melhor score)
  const violationScore = Math.max(0, 100 - (metrics.todayViolations * 5));
  
  // Score geral
  const overallScore = Math.round((policyScore + violationScore) / 2);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Atenção';
    return 'Crítico';
  };

  // Violações recentes por severidade
  const criticalViolations = violations.filter(v => v.severity === 'critical').slice(0, 3);
  const highViolations = violations.filter(v => v.severity === 'high').slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-64">
          <Header />
          <main className="p-6 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Central de Segurança</h1>
              <p className="text-muted-foreground">Visão geral do estado de segurança da organização</p>
            </div>
            <Button onClick={() => navigate('/settings')}>
              Configurar Políticas
            </Button>
          </div>

          {/* Security Score */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Score de Segurança
              </CardTitle>
              <CardDescription>Avaliação geral baseada em políticas ativas e violações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {getScoreLabel(overallScore)}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Políticas Ativas</span>
                      <span>{enabledPolicies}/{totalPolicies}</span>
                    </div>
                    <Progress value={policyScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Índice de Conformidade</span>
                      <span>{violationScore}%</span>
                    </div>
                    <Progress value={violationScore} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Violações Hoje</CardTitle>
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.todayViolations}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {metrics.todayViolations > 5 ? (
                    <><TrendingUp className="h-3 w-3 text-destructive" /> Acima da média</>
                  ) : (
                    <><TrendingDown className="h-3 w-3 text-success" /> Dentro do esperado</>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Críticas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{metrics.criticalViolations}</div>
                <p className="text-xs text-muted-foreground">
                  Requerem atenção imediata
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Políticas Ativas</CardTitle>
                <ShieldCheck className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{enabledPolicies}</div>
                <p className="text-xs text-muted-foreground">
                  de {totalPolicies} disponíveis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
                <Eye className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{metrics.unreadViolations}</div>
                <p className="text-xs text-muted-foreground">
                  aguardando análise
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Critical & High Violations */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Critical */}
            <Card className="border-destructive/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Violações Críticas
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/violations')}>
                    Ver todas <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {criticalViolations.length > 0 ? (
                  <div className="space-y-3">
                    {criticalViolations.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                        <div>
                          <div className="font-medium">{v.employee_name}</div>
                          <div className="text-sm text-muted-foreground">{v.violation_type}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(v.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-success mb-2" />
                    <span>Nenhuma violação crítica</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* High */}
            <Card className="border-warning/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <ShieldAlert className="h-5 w-5" />
                    Violações Alta Severidade
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/violations')}>
                    Ver todas <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {highViolations.length > 0 ? (
                  <div className="space-y-3">
                    {highViolations.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                        <div>
                          <div className="font-medium">{v.employee_name}</div>
                          <div className="text-sm text-muted-foreground">{v.violation_type}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(v.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-success mb-2" />
                    <span>Nenhuma violação de alta severidade</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesse rapidamente as principais funções de segurança</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/violation-rules')}>
                  <ShieldAlert className="h-6 w-6" />
                  <span>Regras de Violação</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/internet-access')}>
                  <Lock className="h-6 w-6" />
                  <span>Acesso Internet</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/sensitive-keywords')}>
                  <Eye className="h-6 w-6" />
                  <span>Palavras Sensíveis</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/rate-limiting')}>
                  <Shield className="h-6 w-6" />
                  <span>Rate Limiting</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
