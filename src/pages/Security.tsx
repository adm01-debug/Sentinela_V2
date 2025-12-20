import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSecurityPage } from '@/hooks/useSecurityPage';
import { SecurityStats, SecurityEventCard } from '@/components/security';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return <Card className="border-destructive"><CardContent className="pt-6 text-center"><h3 className="text-destructive">Erro</h3><Button onClick={resetErrorBoundary} className="mt-4">Tentar novamente</Button></CardContent></Card>;
}

const SecurityContent = React.memo(function SecurityContent() {
  const { events, settings, stats, severityFilter, typeFilter, isLoading, handleSeverityFilterChange, handleTypeFilterChange, handleUpdateSettings, handleResolveEvent } = useSecurityPage();

  if (isLoading) return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div></div>;

  return (
    <div className="space-y-6">
      <SecurityStats {...stats} />
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Eventos de Segurança</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select value={severityFilter} onValueChange={handleSeverityFilterChange}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Severidade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="login_failed">Login Falhou</SelectItem>
                    <SelectItem value="brute_force">Força Bruta</SelectItem>
                    <SelectItem value="suspicious_activity">Atividade Suspeita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                {events.length === 0 ? <p className="text-center text-muted-foreground py-8">Nenhum evento</p> : events.map(e => <SecurityEventCard key={e.id} event={e} onResolve={handleResolveEvent} />)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader><CardTitle>Configurações</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {settings && (
              <>
                <div className="flex items-center justify-between">
                  <Label>MFA Obrigatório</Label>
                  <Switch checked={settings.mfa_required} onCheckedChange={(v) => handleUpdateSettings({ mfa_required: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Whitelist de IP</Label>
                  <Switch checked={settings.ip_whitelist_enabled} onCheckedChange={(v) => handleUpdateSettings({ ip_whitelist_enabled: v })} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default function Security() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div><h1 className="text-3xl font-bold">Segurança</h1><p className="text-muted-foreground">Monitore eventos e configure políticas de segurança</p></div>
      <ErrorBoundary FallbackComponent={ErrorFallback}><Suspense fallback={<Skeleton className="h-96" />}><SecurityContent /></Suspense></ErrorBoundary>
    </div>
  );
}
