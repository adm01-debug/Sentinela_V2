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
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

const blockingPolicies = [
  {
    icon: Monitor,
    title: 'Bloqueio de Print Screen',
    description: 'A captura de tela via tecla Print Screen está bloqueada para proteger informações confidenciais.',
    severity: 'high',
  },
  {
    icon: Usb,
    title: 'Bloqueio de Dispositivos USB',
    description: 'Pendrives e dispositivos USB não autorizados são bloqueados automaticamente.',
    severity: 'critical',
  },
  {
    icon: HardDrive,
    title: 'Bloqueio de HD Externo',
    description: 'Discos rígidos externos não podem ser conectados a este dispositivo.',
    severity: 'critical',
  },
  {
    icon: Globe,
    title: 'Sites Bloqueados',
    description: 'Acesso a sites não relacionados ao trabalho pode estar restrito.',
    severity: 'medium',
  },
  {
    icon: FileWarning,
    title: 'Extensões de Arquivo',
    description: 'Certos tipos de arquivos podem ser bloqueados por questões de segurança.',
    severity: 'medium',
  },
  {
    icon: Clock,
    title: 'Horário de Trabalho',
    description: 'Acesso ao sistema pode ser restrito fora do horário de expediente.',
    severity: 'low',
  },
];

const severityColors = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
};

const severityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

export default function MonitoringPolicies() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-background border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Políticas de Monitoramento</h1>
              <p className="text-muted-foreground">Informações sobre o monitoramento ativo neste dispositivo</p>
            </div>
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

        {/* Blocking Policies */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-semibold">Políticas de Bloqueio</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            As seguintes restrições estão ativas para proteger dados corporativos:
          </p>
          <div className="grid gap-4">
            {blockingPolicies.map((policy, index) => (
              <Card key={index} className="bg-card/50">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={`p-2 rounded-lg ${severityColors[policy.severity as keyof typeof severityColors].split(' ')[0]}`}>
                    <policy.icon className={`h-5 w-5 ${severityColors[policy.severity as keyof typeof severityColors].split(' ')[1]}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{policy.title}</h3>
                    <p className="text-sm text-muted-foreground">{policy.description}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={severityColors[policy.severity as keyof typeof severityColors]}
                  >
                    {severityLabels[policy.severity as keyof typeof severityLabels]}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
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
