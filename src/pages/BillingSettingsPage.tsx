import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PlanKey = 'basic' | 'silver' | 'gold' | 'enterprise';

interface Plan {
  key: PlanKey;
  name: string;
  tagline: string;
  retention: string;
  screenshotRetention: string;
  features: Record<string, boolean | string>;
  highlight?: boolean;
}

const FEATURE_KEYS: Array<{ key: string; label: string }> = [
  { key: 'dashboard', label: 'Dashboard analítico' },
  { key: 'timeline', label: 'Linha do tempo detalhada' },
  { key: 'schedules', label: 'Jornadas de trabalho' },
  { key: 'categories', label: 'Categorização de aplicações' },
  { key: 'station_block', label: 'Bloqueio de estação' },
  { key: 'screenshots', label: 'Captura de tela' },
  { key: 'geo', label: 'Rastreio por geolocalização' },
  { key: 'keystrokes', label: 'Análise de teclas/mouse' },
  { key: 'sso', label: 'Integração SSO (Azure AD)' },
  { key: 'api', label: 'OpenAPI + Webhooks' },
];

const PLANS: Plan[] = [
  {
    key: 'basic',
    name: 'Basic',
    tagline: 'Para times pequenos',
    retention: '30 dias',
    screenshotRetention: '1 dia',
    features: {
      dashboard: true,
      timeline: true,
      schedules: true,
      categories: true,
      station_block: false,
      screenshots: true,
      geo: false,
      keystrokes: false,
      sso: false,
      api: false,
    },
  },
  {
    key: 'silver',
    name: 'Silver',
    tagline: 'Times em crescimento',
    retention: '60 dias',
    screenshotRetention: '3 dias',
    features: {
      dashboard: true,
      timeline: true,
      schedules: true,
      categories: true,
      station_block: false,
      screenshots: true,
      geo: false,
      keystrokes: false,
      sso: false,
      api: false,
    },
  },
  {
    key: 'gold',
    name: 'Gold',
    tagline: 'Recursos avançados',
    retention: '90 dias',
    screenshotRetention: '5 dias',
    highlight: true,
    features: {
      dashboard: true,
      timeline: true,
      schedules: true,
      categories: true,
      station_block: true,
      screenshots: true,
      geo: true,
      keystrokes: true,
      sso: true,
      api: true,
    },
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'Solução corporativa',
    retention: 'Customizável',
    screenshotRetention: 'Customizável',
    features: {
      dashboard: true,
      timeline: true,
      schedules: true,
      categories: true,
      station_block: true,
      screenshots: true,
      geo: true,
      keystrokes: true,
      sso: true,
      api: true,
    },
  },
];

export default function BillingSettingsPage() {
  const [currentPlan] = useState<PlanKey>('gold');
  const { toast } = useToast();

  const handleUpgrade = (planName: string) => {
    toast({
      title: 'Solicitação enviada',
      description: `Nossa equipe entrará em contato sobre o plano ${planName}.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planos e Cobrança</h1>
        <p className="text-muted-foreground">Compare os planos disponíveis e escolha o que atende sua operação.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <Card
            key={plan.key}
            className={`relative ${plan.highlight ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.highlight && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Recomendado</Badge>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {currentPlan === plan.key && <Badge variant="secondary">Atual</Badge>}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{plan.tagline}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="text-muted-foreground">Retenção de dados</p>
                <p className="font-medium">{plan.retention}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Retenção de screenshots</p>
                <p className="font-medium">{plan.screenshotRetention}</p>
              </div>
              <Button
                className="w-full"
                variant={currentPlan === plan.key ? 'secondary' : plan.highlight ? 'default' : 'outline'}
                disabled={currentPlan === plan.key}
                onClick={() => handleUpgrade(plan.name)}
              >
                {currentPlan === plan.key ? (
                  'Plano atual'
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Solicitar contato
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparativo Detalhado</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recurso</TableHead>
                {PLANS.map((p) => (
                  <TableHead key={p.key} className="text-center">{p.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEATURE_KEYS.map((f) => (
                <TableRow key={f.key}>
                  <TableCell className="font-medium">{f.label}</TableCell>
                  {PLANS.map((p) => {
                    const v = p.features[f.key];
                    return (
                      <TableCell key={p.key} className="text-center">
                        {typeof v === 'boolean' ? (
                          v ? (
                            <Check className="h-4 w-4 mx-auto text-success" aria-label="Incluído" />
                          ) : (
                            <X className="h-4 w-4 mx-auto text-muted-foreground" aria-label="Não incluído" />
                          )
                        ) : (
                          <span className="text-sm">{v}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
