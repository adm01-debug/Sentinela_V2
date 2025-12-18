import { useState, useEffect } from 'react';
import { 
  Shield, 
  Eye, 
  Keyboard, 
  MousePointer, 
  Monitor, 
  Usb, 
  HardDrive, 
  Globe, 
  Clock, 
  FileWarning,
  Bell,
  Lock,
  AlertTriangle,
  Ban,
  FileText,
  Type,
  AppWindow,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { PolicyAcknowledgmentDialog } from '@/components/PolicyAcknowledgmentDialog';
import { useAuth } from '@/hooks/useAuth';

interface ViolationRule {
  id: string;
  rule_type: string;
  rule_value: string;
  severity: string;
  description: string | null;
  is_active: boolean;
  violation_count: number;
}

const monitoringFeatures = [
  {
    icon: Keyboard,
    title: 'Monitoramento de Teclado',
    description: 'Todas as teclas digitadas são registradas para análise de produtividade e segurança.',
    active: true,
  },
  {
    icon: MousePointer,
    title: 'Rastreamento de Cliques',
    description: 'Cliques do mouse são registrados, incluindo posição e aplicativo ativo.',
    active: true,
  },
  {
    icon: Monitor,
    title: 'Capturas de Tela',
    description: 'Screenshots periódicos são capturados para monitoramento de atividades.',
    active: true,
  },
  {
    icon: Eye,
    title: 'Aplicativos em Uso',
    description: 'O tempo gasto em cada aplicativo é monitorado e categorizado.',
    active: true,
  },
  {
    icon: Clock,
    title: 'Tempo Ativo/Ocioso',
    description: 'Períodos de atividade e inatividade são registrados automaticamente.',
    active: true,
  },
];

const staticBlockingPolicies = [
  {
    icon: Monitor,
    title: 'Bloqueio de Print Screen',
    description: 'A captura de tela via tecla Print Screen está bloqueada para proteger informações confidenciais.',
    severity: 'high',
    type: 'system',
  },
  {
    icon: Usb,
    title: 'Bloqueio de Dispositivos USB',
    description: 'Pendrives e dispositivos USB não autorizados são bloqueados automaticamente.',
    severity: 'critical',
    type: 'system',
  },
  {
    icon: HardDrive,
    title: 'Bloqueio de HD Externo',
    description: 'Discos rígidos externos não podem ser conectados a este dispositivo.',
    severity: 'critical',
    type: 'system',
  },
];

const ruleTypeConfig: Record<string, { icon: typeof Globe; label: string; color: string }> = {
  blocked_site: { icon: Globe, label: 'Site Bloqueado', color: 'text-blue-500' },
  blocked_app: { icon: AppWindow, label: 'Aplicativo Bloqueado', color: 'text-purple-500' },
  blocked_keyword: { icon: Type, label: 'Palavra-chave Bloqueada', color: 'text-orange-500' },
  blocked_file_extension: { icon: FileText, label: 'Extensão Bloqueada', color: 'text-red-500' },
  work_hours: { icon: Clock, label: 'Horário de Trabalho', color: 'text-green-500' },
};

const severityColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
};

const severityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

export default function MonitoringPolicies() {
  const [dynamicRules, setDynamicRules] = useState<ViolationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [checkingAcknowledgment, setCheckingAcknowledgment] = useState(true);
  const { user } = useAuth();
  
  const employeeName = user?.user_metadata?.full_name || user?.email || 'Funcionário';

  useEffect(() => {
    fetchPolicies();
    checkAcknowledgment();
  }, [employeeName]);

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-policies');
      
      if (error) {
        console.error('Error fetching policies:', error);
        return;
      }
      
      if (data?.rules) {
        setDynamicRules(data.rules);
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAcknowledgment = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_acknowledgments')
        .select('id')
        .eq('employee_name', employeeName)
        .order('acknowledged_at', { ascending: false })
        .limit(1);
      
      if (!error && data && data.length > 0) {
        setHasAcknowledged(true);
      }
    } catch (err) {
      console.error('Failed to check acknowledgment:', err);
    } finally {
      setCheckingAcknowledgment(false);
    }
  };

  const handleAcknowledged = () => {
    setHasAcknowledged(true);
  };

  // Group rules by type
  const groupedRules = dynamicRules.reduce((acc, rule) => {
    const type = rule.rule_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(rule);
    return acc;
  }, {} as Record<string, ViolationRule[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-background border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Políticas de Monitoramento</h1>
                <p className="text-muted-foreground">Informações sobre o monitoramento ativo neste dispositivo</p>
              </div>
            </div>
            
            {!checkingAcknowledgment && (
              <div className="shrink-0">
                {hasAcknowledged ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">Políticas Aceitas</span>
                  </div>
                ) : (
                  <PolicyAcknowledgmentDialog 
                    employeeName={employeeName} 
                    onAcknowledged={handleAcknowledged}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Notice */}
        <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-400 mb-1">Aviso Importante</h3>
              <p className="text-sm text-muted-foreground">
                Este dispositivo está sendo monitorado para fins de segurança corporativa. 
                Todas as atividades podem ser registradas e analisadas pela equipe de TI. 
                Use este equipamento apenas para fins profissionais.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monitoring Features */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">O que é Monitorado</h2>
          </div>
          <div className="grid gap-4">
            {monitoringFeatures.map((feature, index) => (
              <Card key={index} className="bg-card/50">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  {feature.active && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                      Ativo
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* System Blocking Policies */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-semibold">Políticas de Bloqueio do Sistema</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Restrições de hardware aplicadas pelo agente de monitoramento:
          </p>
          <div className="grid gap-4">
            {staticBlockingPolicies.map((policy, index) => (
              <Card key={index} className="bg-card/50">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={`p-2 rounded-lg ${severityColors[policy.severity]?.split(' ')[0] || 'bg-muted'}`}>
                    <policy.icon className={`h-5 w-5 ${severityColors[policy.severity]?.split(' ')[1] || 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{policy.title}</h3>
                    <p className="text-sm text-muted-foreground">{policy.description}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={severityColors[policy.severity] || ''}
                  >
                    {severityLabels[policy.severity] || policy.severity}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* Dynamic Rules from Database */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Ban className="h-5 w-5 text-warning" />
            <h2 className="text-xl font-semibold">Regras de Violação Ativas</h2>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Regras configuradas pelo administrador que geram alertas quando violadas:
          </p>

          {loading ? (
            <Card className="bg-card/50">
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Carregando regras...</span>
              </CardContent>
            </Card>
          ) : dynamicRules.length === 0 ? (
            <Card className="bg-card/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma regra de violação configurada.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedRules).map(([ruleType, rules]) => {
                const config = ruleTypeConfig[ruleType] || { 
                  icon: AlertTriangle, 
                  label: ruleType, 
                  color: 'text-muted-foreground' 
                };
                const IconComponent = config.icon;

                return (
                  <div key={ruleType}>
                    <div className="flex items-center gap-2 mb-3">
                      <IconComponent className={`h-4 w-4 ${config.color}`} />
                      <h3 className="font-medium text-sm">{config.label}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {rules.length}
                      </Badge>
                    </div>
                    <div className="grid gap-2">
                      {rules.map((rule) => (
                        <Card key={rule.id} className="bg-card/30 border-border/50">
                          <CardContent className="flex items-center gap-3 py-3 px-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{rule.rule_value}</p>
                              {rule.description && (
                                <p className="text-xs text-muted-foreground truncate">{rule.description}</p>
                              )}
                            </div>
                            {rule.violation_count > 0 && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs shrink-0 bg-destructive/10 text-destructive border-destructive/30"
                              >
                                {rule.violation_count} {rule.violation_count === 1 ? 'violação' : 'violações'}
                              </Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-xs shrink-0 ${severityColors[rule.severity] || ''}`}
                            >
                              {severityLabels[rule.severity] || rule.severity}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <Separator className="my-8" />

        {/* Violation Response */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-warning" />
            <h2 className="text-xl font-semibold">O que Acontece em Caso de Violação</h2>
          </div>
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Você receberá uma notificação imediata sobre a violação detectada.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Uma captura de tela pode ser realizada como evidência.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>O administrador de TI será notificado sobre o incidente.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Violações repetidas podem resultar em ações administrativas.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Em caso de dúvidas sobre as políticas de monitoramento, entre em contato com o departamento de TI.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
