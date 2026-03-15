import { CreditCard, Package, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useBilling } from '@/hooks/useBilling';

export default function BillingSettingsPage() {
  const { companyPlan, isLoadingPlan } = useBilling();

  if (isLoadingPlan) return <div className="p-6 space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>;

  const plan = companyPlan?.plan ?? 'Enterprise';
  const maxEmp = companyPlan?.maxEmployees;
  const currentEmp = companyPlan?.currentEmployees ?? 0;
  const empPercent = maxEmp ? Math.round((currentEmp / maxEmp) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6 text-primary" />Faturamento</h1><p className="text-muted-foreground mt-1">Gerencie plano, pagamento e faturas</p></div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Plano Atual</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div><p className="text-xl font-bold capitalize">{plan}</p><p className="text-muted-foreground">{companyPlan?.companyName ?? 'Monitoramento completo'}</p></div>
            <Badge variant="default" className="text-lg px-4 py-1">{companyPlan?.isActive !== false ? 'Ativo' : 'Inativo'}</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Funcionários</span><span>{currentEmp} / {maxEmp ?? 'Ilimitado'}</span></div>
            <Progress value={maxEmp ? empPercent : 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />Histórico de Faturas</CardTitle></CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">Nenhuma fatura disponível.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export { BillingSettingsPage };
