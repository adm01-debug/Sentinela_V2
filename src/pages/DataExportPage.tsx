import { useState } from 'react';
import { Download, FileDown, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EXPORT_TYPES = [
  { value: 'employees', label: 'Funcionários', icon: FileText },
  { value: 'activities', label: 'Atividades', icon: FileSpreadsheet },
  { value: 'violations', label: 'Violações', icon: FileDown },
  { value: 'devices', label: 'Dispositivos', icon: FileDown },
  { value: 'keystroke_logs', label: 'Logs de Teclas', icon: FileDown },
  { value: 'click_logs', label: 'Logs de Cliques', icon: FileDown },
];

export default function DataExportPage() {
  const { toast } = useToast();
  const [dataType, setDataType] = useState('employees');
  const [format, setFormat] = useState('csv');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { error } = await supabase.functions.invoke('export-data', {
        body: { type: dataType, format, date_from: dateFrom || undefined, date_to: dateTo || undefined },
      });
      if (error) throw error;
      toast({ title: 'Exportação concluída!', description: `Dados de ${EXPORT_TYPES.find(t => t.value === dataType)?.label} exportados.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao exportar dados';
      toast({ title: 'Erro na exportação', description: message, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exportação de Dados"
        description="Exporte relatórios e dados do sistema"
        showBackButton={false}
      />

      <Card>
        <CardHeader><CardTitle>Configurar Exportação</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Tipo de Dados</Label>
            <Select value={dataType} onValueChange={setDataType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EXPORT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div><Label>Formato</Label>
            <Select value={format} onValueChange={setFormat}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="csv">CSV</SelectItem><SelectItem value="json">JSON</SelectItem><SelectItem value="excel">Excel</SelectItem></SelectContent></Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Data Início</Label><Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
            <div><Label>Data Fim</Label><Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
          </div>
          <Button onClick={handleExport} disabled={isExporting} className="w-full">
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export { DataExportPage };
