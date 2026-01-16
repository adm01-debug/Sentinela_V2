import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button  } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent  } from '@/components/ui/card';
import { Switch  } from '@/components/ui/switch';
import { Badge  } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/AlertDialog';
import { useAlertRules, useDeleteAlertRule, useToggleAlertRule } from '@/hooks/useAlerts';

export default function AlertRulesPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: rules, isLoading } = useAlertRules();
  const deleteRule = useDeleteAlertRule();
  const toggleRule = useToggleAlertRule();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Regras de Alerta</h1>
        <Link to="/alerts/rules/new"><Button><Plus className="mr-2 h-4 w-4" />Nova Regra</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules?.map(rule => (
          <Card key={rule.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <CardTitle className="text-base">{rule.name}</CardTitle>
              </div>
              <Switch checked={rule.active} onCheckedChange={() => toggleRule.mutate(rule.id)} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{rule.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={rule.severity === 'critical' ? 'destructive' : 'secondary'}>{rule.severity}</Badge>
                <span className="text-xs text-muted-foreground">Condição: {rule.condition}</span>
              </div>
              <div className="flex gap-2">
                <Link to={`/alerts/rules/${rule.id}/edit`}><Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button></Link>
                <Button variant="outline" size="sm" onClick={() => setDeleteId(rule.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteRule.mutate(deleteId!); setDeleteId(null); }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}