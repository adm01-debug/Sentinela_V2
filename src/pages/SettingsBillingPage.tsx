import { CreditCard, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBilling } from '@/hooks/useBilling';

export default function SettingsBillingPage() {
  const billing = useBilling();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plano Atual</CardTitle>
          <CardDescription>Gerencie sua assinatura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 bg-primary/5 rounded-lg">
            <div>
              <h3 className="text-2xl font-bold">{billing.subscription?.planId || 'Free'}</h3>
              <p className="text-muted-foreground">Plano ativo</p>
            </div>
            <Badge variant="default" className="mt-2"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline">Alterar plano</Button>
          <Button variant="outline">Cancelar assinatura</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader><CardTitle>Histórico de Faturas</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {billing.invoices?.map((invoice: any) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div><p className="font-medium">{invoice.date || invoice.created_at}</p></div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">R$ {invoice.amount || '0'}</span>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
