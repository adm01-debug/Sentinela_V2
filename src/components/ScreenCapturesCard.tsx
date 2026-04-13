import { useState, memo, useEffect, useMemo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Monitor, Loader2, Search, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';
import { CaptureGrid } from './screen-captures/CaptureGrid';
import { CaptureDialog } from './screen-captures/CaptureDialog';

interface ScreenCapture {
  id: string;
  employee_name: string;
  device: string | null;
  capture_url: string;
  app_name: string | null;
  window_title: string | null;
  captured_at: string;
  extracted_text: string | null;
  ocr_processed_at: string | null;
}

interface SensitiveKeyword {
  rule_value: string;
  severity: string;
}

function ScreenCapturesCardBase() {
  const [captures, setCaptures] = useState<ScreenCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCapture, setSelectedCapture] = useState<ScreenCapture | null>(null);
  const [ocrLoading, setOcrLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sensitiveKeywords, setSensitiveKeywords] = useState<SensitiveKeyword[]>([]);

  useEffect(() => { fetchCaptures(); fetchSensitiveKeywords(); }, []);

  const fetchCaptures = async () => {
    try {
      const { data, error } = await supabase.from('screen_captures').select('*').order('captured_at', { ascending: false }).limit(50);
      if (error) throw error;
      setCaptures(data || []);
    } catch (error) { logger.error('Error fetching screen captures:', error); } finally { setLoading(false); }
  };

  const fetchSensitiveKeywords = async () => {
    try {
      const { data, error } = await supabase.from('violation_rules').select('rule_value, severity').eq('rule_type', 'blocked_keyword').eq('is_active', true);
      if (error) throw error;
      setSensitiveKeywords(data || []);
    } catch (error) { logger.error('Error fetching sensitive keywords:', error); }
  };

  const filteredCaptures = useMemo(() => {
    if (!searchQuery.trim()) return captures.slice(0, 12);
    const query = searchQuery.toLowerCase();
    return captures.filter(c => c.extracted_text?.toLowerCase().includes(query) || c.employee_name.toLowerCase().includes(query) || c.window_title?.toLowerCase().includes(query) || c.app_name?.toLowerCase().includes(query));
  }, [captures, searchQuery]);

  const getOcrStatus = (capture: ScreenCapture) => {
    if (capture.extracted_text) return 'completed';
    if (capture.ocr_processed_at) return 'no-text';
    const twoMinutes = 2 * 60 * 1000;
    if (Date.now() - new Date(capture.captured_at).getTime() < twoMinutes) return 'processing';
    return 'pending';
  };

  const findSensitiveKeywordsInText = (text: string | null): { keyword: string; severity: string }[] => {
    if (!text) return [];
    const textLower = text.toLowerCase();
    return sensitiveKeywords.filter(kw => textLower.includes(kw.rule_value.toLowerCase())).map(kw => ({ keyword: kw.rule_value, severity: kw.severity }));
  };

  const highlightSensitiveText = (text: string | null): ReactNode => {
    if (!text || sensitiveKeywords.length === 0) return text;
    const keywordPatterns = sensitiveKeywords.map(kw => kw.rule_value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(Boolean);
    if (keywordPatterns.length === 0) return text;
    const regex = new RegExp(`(${keywordPatterns.join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => {
      const matchedKeyword = sensitiveKeywords.find(kw => kw.rule_value.toLowerCase() === part.toLowerCase());
      if (matchedKeyword) {
        const severityColor = matchedKeyword.severity === 'critical' ? 'bg-red-500/30 border-red-500' : matchedKeyword.severity === 'high' ? 'bg-orange-500/30 border-orange-500' : 'bg-yellow-500/30 border-yellow-500';
        return (
          <TooltipProvider key={i}><Tooltip><TooltipTrigger asChild>
            <mark className={`${severityColor} text-foreground rounded px-1 border cursor-help font-semibold`}>{part}</mark>
          </TooltipTrigger><TooltipContent><div className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-destructive" /><span>Palavra sensível: <strong>{matchedKeyword.rule_value}</strong></span><Badge variant="outline" className="text-[10px] ml-1">{matchedKeyword.severity}</Badge></div></TooltipContent></Tooltip></TooltipProvider>
        );
      }
      return part;
    });
  };

  const highlightMatch = (text: string, query: string): ReactNode => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => regex.test(part) ? <mark key={i} className="bg-yellow-500/30 text-foreground rounded px-0.5">{part}</mark> : part);
  };

  const runOcr = async (capture: ScreenCapture) => {
    setOcrLoading(capture.id);
    try {
      const { data, error } = await supabase.functions.invoke('ocr-screenshot', { body: { screenshot_id: capture.id, screenshot_url: capture.capture_url } });
      if (error) throw error;
      if (data.error) { toast.error(data.error); return; }
      setCaptures(prev => prev.map(c => c.id === capture.id ? { ...c, extracted_text: data.extracted_text, ocr_processed_at: new Date().toISOString() } : c));
      if (selectedCapture?.id === capture.id) setSelectedCapture({ ...selectedCapture, extracted_text: data.extracted_text, ocr_processed_at: new Date().toISOString() });
      toast.success('Texto extraído com sucesso!');
    } catch (error) { logger.error('OCR error:', error); toast.error('Erro ao extrair texto da imagem'); } finally { setOcrLoading(null); }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Texto copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (<Card><CardHeader><CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5 text-primary" />Capturas de Tela</CardTitle></CardHeader><CardContent className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></CardContent></Card>);
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5 text-primary" />Capturas de Tela</CardTitle>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por texto OCR..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 pr-8 h-8 text-sm" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
            </div>
          </div>
          {searchQuery && <p className="text-xs text-muted-foreground mt-2">{filteredCaptures.length} resultado(s) para "{searchQuery}"</p>}
        </CardHeader>
        <CardContent>
          {captures.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma captura de tela</p>
          ) : filteredCaptures.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum resultado encontrado para "{searchQuery}"</p>
          ) : (
            <CaptureGrid captures={filteredCaptures} searchQuery={searchQuery} onSelect={setSelectedCapture} highlightMatch={highlightMatch} getOcrStatus={getOcrStatus} />
          )}
        </CardContent>
      </Card>

      <CaptureDialog capture={selectedCapture} onClose={() => setSelectedCapture(null)} onRunOcr={runOcr} ocrLoading={ocrLoading} copied={copied} onCopy={copyText} findSensitiveKeywords={findSensitiveKeywordsInText} highlightSensitiveText={highlightSensitiveText} />
    </>
  );
}

export const ScreenCapturesCard = memo(ScreenCapturesCardBase);
export default ScreenCapturesCard;
