import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompliance } from '@/hooks/useCompliance';

export default function CompliancePage() {
  const { rules, checking, compliancePercentage } = useCompliance();
  const compliant = rules.filter(i => i.status === 'compliant').length;

  if (checking) return <div className="p-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />Compliance</h1><p className="text-muted-foreground mt-1">Status de conformidade e políticas</p></div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-2"><span className="font-medium">Conformidade Geral</span><span className="font-bold">{compliancePercentage}%</span></div>
              <Progress value={compliancePercentage} className="h-3" />
            </div>
            <div className="text-center"><p className="text-3xl font-bold text-green-600">{compliant}/{rules.length}</p><p className="text-xs text-muted-foreground">Itens conformes</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {rules.map((item, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-4">
              {item.status === 'compliant' ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0" /> : <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />}
              <div className="flex-1">
                <div className="flex items-center gap-2"><p className="font-medium">{item.name}</p><Badge variant="outline">{item.category}</Badge></div>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
              <Badge variant={item.status === 'compliant' ? 'default' : 'secondary'}>{item.status === 'compliant' ? 'Conforme' : 'Parcial'}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { CompliancePage };
