import * as React from 'react';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Download, Calendar as CalendarIcon, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReportConfig { id: string; name: string; type: 'pdf' | 'excel' | 'csv'; filters?: { key: string; label: string; options: { value: string; label: string }[] }[]; }

export function ReportGenerator({ reports, onGenerate, className }: { reports: ReportConfig[]; onGenerate: (reportId: string, format: string, dateRange: { from: Date; to: Date }, filters: Record<string, string>) => Promise<void>; className?: string }) {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedReportConfig = reports.find(r => r.id === selectedReport);

  const handleGenerate = async () => {
    if (!selectedReport) return;
    setIsGenerating(true);
    try { await onGenerate(selectedReport, format, dateRange, filters); }
    finally { setIsGenerating(false); }
  };

  return (
    <Card className={className}>
      <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Report Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="text-sm font-medium mb-2 block">Report Type</label><Select value={selectedReport} onValueChange={setSelectedReport}><SelectTrigger><SelectValue placeholder="Select report..." /></SelectTrigger><SelectContent>{reports.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-sm font-medium mb-2 block">Format</label><Select value={format} onValueChange={(v: any) => setFormat(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pdf">PDF</SelectItem><SelectItem value="excel">Excel</SelectItem><SelectItem value="csv">CSV</SelectItem></SelectContent></Select></div>
        </div>
        <div><label className="text-sm font-medium mb-2 block">Date Range</label><div className="flex gap-2">
          <Popover><PopoverTrigger asChild><Button variant="outline" className="flex-1 justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{format(dateRange.from, 'PP')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateRange.from} onSelect={(d) => d && setDateRange(p => ({ ...p, from: d }))} /></PopoverContent></Popover>
          <Popover><PopoverTrigger asChild><Button variant="outline" className="flex-1 justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{format(dateRange.to, 'PP')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateRange.to} onSelect={(d) => d && setDateRange(p => ({ ...p, to: d }))} /></PopoverContent></Popover>
        </div></div>
        {selectedReportConfig?.filters && <div className="space-y-3"><label className="text-sm font-medium flex items-center gap-2"><Filter className="h-4 w-4" />Filters</label>{selectedReportConfig.filters.map(f => <Select key={f.key} value={filters[f.key] || ''} onValueChange={(v) => setFilters(p => ({ ...p, [f.key]: v }))}><SelectTrigger><SelectValue placeholder={f.label} /></SelectTrigger><SelectContent>{f.options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>)}</div>}
        <Button className="w-full" onClick={handleGenerate} disabled={!selectedReport || isGenerating}>{isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Download className="mr-2 h-4 w-4" />Generate Report</>}</Button>
      </CardContent>
    </Card>
  );
}
export default ReportGenerator;
