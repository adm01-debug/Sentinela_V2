import { Shield, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const COMPLIANCE_ITEMS = [
  { name: 'LGPD - Consentimento', status: 'compliant', category: 'Dados Pessoais', description: 'Coleta de consentimento para monitoramento' },
  { name: 'LGPD - Transparência', status: 'compliant', category: 'Dados Pessoais', description: 'Política de privacidade e notificação aos funcionários' },
  { name: 'Retenção de Dados', status: 'compliant', category: 'Armazenamento', description: 'Dados retidos por no máximo 30 dias' },
  { name: 'Criptografia em Trânsito', status: 'compliant', category: 'Segurança', description: 'TLS/SSL em todas as comunicações' },
  { name: 'Criptografia em Repouso', status: 'compliant', category: 'Segurança', description: 'Dados criptografados no banco' },
  { name: 'Controle de Acesso', status: 'compliant', category: 'Segurança', description: 'RBAC com Row Level Security' },
  { name: 'Log de Auditoria', status: 'partial', category: 'Auditoria', description: 'Registro de ações administrativas' },
  { name: 'Backup Automático', status: 'compliant', category: 'Armazenamento', description: 'Backups diários automatizados' },
  { name: 'Direito ao Esquecimento', status: 'compliant', category: 'Dados Pessoais', description: 'Edge Function para exclusão de dados do usuário' },
  { name: 'Geobloqueio', status: 'compliant', category: 'Segurança', description: 'Restrição de acesso por localização geográfica' },
];

export default function CompliancePage() {
  const compliant = COMPLIANCE_ITEMS.filter(i => i.status === 'compliant').length;
  const total = COMPLIANCE_ITEMS.length;
  const percentage = Math.round((compliant / total) * 100);

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />Compliance</h1><p className="text-muted-foreground mt-1">Status de conformidade e políticas</p></div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-2"><span className="font-medium">Conformidade Geral</span><span className="font-bold">{percentage}%</span></div>
              <Progress value={percentage} className="h-3" />
            </div>
            <div className="text-center"><p className="text-3xl font-bold text-green-600">{compliant}/{total}</p><p className="text-xs text-muted-foreground">Itens conformes</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {COMPLIANCE_ITEMS.map((item, i) => (
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
