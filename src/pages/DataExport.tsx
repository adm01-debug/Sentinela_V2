import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Download, Database, FileJson, FileSpreadsheet, Archive, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ExportTable {
  id: string;
  name: string;
  label: string;
  description: string;
  category: 'monitoring' | 'security' | 'employees' | 'settings';
}

const exportTables: ExportTable[] = [
  { id: 'employees', name: 'employees', label: 'Colaboradores', description: 'Dados dos colaboradores', category: 'employees' },
  { id: 'teams', name: 'teams', label: 'Equipes', description: 'Estrutura de equipes', category: 'employees' },
  { id: 'team_members', name: 'team_members', label: 'Membros de Equipes', description: 'Associação equipe-colaborador', category: 'employees' },
  { id: 'keystroke_logs', name: 'keystroke_logs', label: 'Logs de Teclas', description: 'Registros de atividade de teclado', category: 'monitoring' },
  { id: 'click_logs', name: 'click_logs', label: 'Logs de Cliques', description: 'Registros de cliques do mouse', category: 'monitoring' },
  { id: 'screen_captures', name: 'screen_captures', label: 'Capturas de Tela', description: 'Metadados das capturas', category: 'monitoring' },
  { id: 'productivity_logs', name: 'productivity_logs', label: 'Logs de Produtividade', description: 'Métricas de produtividade', category: 'monitoring' },
  { id: 'session_recordings', name: 'session_recordings', label: 'Gravações de Sessão', description: 'Registros de sessões', category: 'monitoring' },
  { id: 'security_violations', name: 'security_violations', label: 'Violações de Segurança', description: 'Alertas e violações', category: 'security' },
  { id: 'violation_rules', name: 'violation_rules', label: 'Regras de Violação', description: 'Configurações de regras', category: 'security' },
  { id: 'geofences', name: 'geofences', label: 'Geofences', description: 'Zonas geográficas', category: 'security' },
  { id: 'geofence_violations', name: 'geofence_violations', label: 'Violações de Geofence', description: 'Alertas de localização', category: 'security' },
  { id: 'internet_access_settings', name: 'internet_access_settings', label: 'Configurações de Internet', description: 'Regras de acesso', category: 'settings' },
  { id: 'work_schedules', name: 'work_schedules', label: 'Jornadas de Trabalho', description: 'Horários configurados', category: 'settings' },
  { id: 'monitoring_settings', name: 'monitoring_settings', label: 'Configurações de Monitoramento', description: 'Parâmetros do sistema', category: 'settings' },
  { id: 'application_rules', name: 'application_rules', label: 'Regras de Aplicativos', description: 'Políticas de aplicativos', category: 'settings' },
  { id: 'mobile_devices', name: 'mobile_devices', label: 'Dispositivos Móveis', description: 'Dispositivos registrados', category: 'monitoring' },
  { id: 'mobile_activity_logs', name: 'mobile_activity_logs', label: 'Atividade Móvel', description: 'Logs de dispositivos móveis', category: 'monitoring' },
  { id: 'agent_keys', name: 'agent_keys', label: 'Chaves de Agente', description: 'Chaves de autenticação', category: 'settings' },
  { id: 'policy_acknowledgments', name: 'policy_acknowledgments', label: 'Aceites de Política', description: 'Confirmações dos colaboradores', category: 'security' },
];

const categoryLabels: Record<string, string> = {
  monitoring: 'Monitoramento',
  security: 'Segurança',
  employees: 'Colaboradores',
  settings: 'Configurações',
};

export default function DataExport() {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xlsx'>('json');
  
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportedTables, setExportedTables] = useState<string[]>([]);

  const handleToggleTable = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(t => t !== tableId)
        : [...prev, tableId]
    );
  };

  const handleSelectCategory = (category: string) => {
    const categoryTables = exportTables.filter(t => t.category === category).map(t => t.id);
    const allSelected = categoryTables.every(t => selectedTables.includes(t));
    
    if (allSelected) {
      setSelectedTables(prev => prev.filter(t => !categoryTables.includes(t)));
    } else {
      setSelectedTables(prev => [...new Set([...prev, ...categoryTables])]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTables.length === exportTables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(exportTables.map(t => t.id));
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
        return String(value).replace(/"/g, '""');
      }).map(v => `"${v}"`).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadFile = (content: string | ArrayBuffer, filename: string, mimeType: string) => {
    const blob = content instanceof ArrayBuffer 
      ? new Blob([content], { type: mimeType })
      : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (data: Record<string, any[]>, timestamp: string) => {
    const workbook = XLSX.utils.book_new();
    
    for (const [tableName, tableData] of Object.entries(data)) {
      if (tableData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(tableData);
        // Ajustar largura das colunas
        const colWidths = Object.keys(tableData[0]).map(key => ({
          wch: Math.max(
            key.length,
            ...tableData.map(row => String(row[key] || '').length).slice(0, 100)
          )
        }));
        worksheet['!cols'] = colWidths;
        
        // Nome da aba limitado a 31 caracteres (limite do Excel)
        const sheetName = tableName.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    }
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    downloadFile(excelBuffer, `backup-${timestamp}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };

  const handleExport = async () => {
    if (selectedTables.length === 0) {
      toast.error('Selecione pelo menos uma tabela para exportar');
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setExportedTables([]);

    const exportData: Record<string, any[]> = {};
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    try {
      for (let i = 0; i < selectedTables.length; i++) {
        const tableId = selectedTables[i];
        const table = exportTables.find(t => t.id === tableId);
        
        if (table) {
          const { data, error } = await supabase
            .from(table.name as any)
            .select('*');

          if (error) {
            console.error(`Erro ao exportar ${table.label}:`, error);
            toast.error(`Erro ao exportar ${table.label}`);
          } else {
            exportData[table.name] = data || [];
            setExportedTables(prev => [...prev, tableId]);
          }
        }

        setProgress(Math.round(((i + 1) / selectedTables.length) * 100));
      }

      if (exportFormat === 'json') {
        const jsonContent = JSON.stringify({
          exportDate: new Date().toISOString(),
          version: '1.0',
          tables: exportData
        }, null, 2);
        downloadFile(jsonContent, `backup-${timestamp}.json`, 'application/json');
      } else if (exportFormat === 'xlsx') {
        exportToExcel(exportData, timestamp);
      } else {
        // Para CSV, criar um arquivo por tabela
        for (const [tableName, data] of Object.entries(exportData)) {
          if (data.length > 0) {
            const csvContent = convertToCSV(data);
            downloadFile(csvContent, `${tableName}-${timestamp}.csv`, 'text/csv');
          }
        }
      }

      toast.success(`Exportação concluída! ${Object.keys(exportData).length} tabelas exportadas.`);
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast.error('Erro durante a exportação');
    } finally {
      setIsExporting(false);
    }
  };

  const groupedTables = exportTables.reduce((acc, table) => {
    if (!acc[table.category]) acc[table.category] = [];
    acc[table.category].push(table);
    return acc;
  }, {} as Record<string, ExportTable[]>);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Archive className="h-6 w-6" />
                Exportação de Dados
              </h1>
              <p className="text-muted-foreground mt-1">
                Exporte dados do sistema para backup ou análise externa
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Selecionar Tabelas
                </CardTitle>
                <CardDescription>
                  Escolha quais dados deseja exportar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedTables.length === exportTables.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedTables.length} de {exportTables.length} selecionadas
                  </span>
                </div>

                {Object.entries(groupedTables).map(([category, tables]) => {
                  const categorySelected = tables.filter(t => selectedTables.includes(t.id)).length;
                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground">{categoryLabels[category]}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSelectCategory(category)}
                        >
                          {categorySelected === tables.length ? 'Desmarcar' : 'Selecionar'} Categoria
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {tables.map(table => (
                          <div
                            key={table.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                              selectedTables.includes(table.id) 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-muted-foreground/50'
                            }`}
                            onClick={() => handleToggleTable(table.id)}
                          >
                            <Checkbox
                              id={table.id}
                              checked={selectedTables.includes(table.id)}
                              onCheckedChange={() => handleToggleTable(table.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <Label htmlFor={table.id} className="font-medium cursor-pointer">
                                {table.label}
                              </Label>
                              <p className="text-xs text-muted-foreground">{table.description}</p>
                            </div>
                            {exportedTables.includes(table.id) && (
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formato de Exportação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={exportFormat} onValueChange={(v: 'json' | 'csv' | 'xlsx') => setExportFormat(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        JSON - Arquivo único com todos os dados
                      </div>
                    </SelectItem>
                    <SelectItem value="xlsx">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        Excel (.xlsx) - Arquivo único com múltiplas abas
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        CSV - Um arquivo por tabela
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {isExporting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Exportando...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <Button 
                  onClick={handleExport} 
                  disabled={isExporting || selectedTables.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar {selectedTables.length} Tabela{selectedTables.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
