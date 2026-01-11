import { CreditCard, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useBilling, useInvoices } from '@/hooks/useBilling';

export default function SettingsBillingPage() {
  const { data: billing } = useBilling();
  const { data: invoices } = useInvoices();

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
              <h3 className="text-2xl font-bold">{billing?.planName}</h3>
              <p className="text-muted-foreground">{billing?.seats} usuários · {billing?.storage} GB de armazenamento</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">R$ {billing?.price}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              <Badge variant="default" className="mt-2"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline">Alterar plano</Button>
          <Button variant="outline">Cancelar assinatura</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
              <div><p className="font-medium">•••• •••• •••• {billing?.cardLast4}</p><p className="text-sm text-muted-foreground">Expira em {billing?.cardExpiry}</p></div>
            </div>
            <Button variant="outline" size="sm">Atualizar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Histórico de Faturas</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices?.map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div><p className="font-medium">{invoice.date}</p><p className="text-sm text-muted-foreground">{invoice.description}</p></div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">R$ {invoice.amount}</span>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>{invoice.status === 'paid' ? 'Pago' : 'Pendente'}</Badge>
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