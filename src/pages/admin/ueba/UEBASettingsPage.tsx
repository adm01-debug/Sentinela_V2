import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye } from 'lucide-react';

interface Factor {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  weight: number;
  category: string;
  enabled: boolean;
}

export const UEBASettingsPage = () => {
  const navigate = useNavigate();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [shadowMode, setShadowMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('risk_score_factors').select('*').order('category, name');
      setFactors((data as Factor[]) || []);
      setLoading(false);
    })();
  }, []);

  const updateFactor = (id: string, patch: Partial<Factor>) => {
    setFactors((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const f of factors) {
        const { error } = await supabase
          .from('risk_score_factors')
          .update({ weight: f.weight, enabled: f.enabled })
          .eq('id', f.id);
        if (error) throw error;
      }
      toast.success('Configurações salvas');
    } catch (e) {
      toast.error('Falha ao salvar', { description: e instanceof Error ? e.message : 'Unknown' });
    } finally {
      setSaving(false);
    }
  };

  const grouped = factors.reduce<Record<string, Factor[]>>((acc, f) => {
    (acc[f.category] = acc[f.category] || []).push(f);
    return acc;
  }, {});

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/ueba')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configurações UEBA</h1>
            <p className="text-sm text-muted-foreground">Pesos de fatores e modo shadow</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4" />
              Shadow Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Modo de Calibração</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Calcula scores mas não dispara alertas. Recomendado por 30 dias após instalação.
                </p>
              </div>
              <Switch checked={shadowMode} onCheckedChange={setShadowMode} />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">Carregando fatores...</CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                  {category}
                  <Badge variant="outline" className="text-[10px]">
                    {items.length} fatores
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((f) => (
                  <div key={f.id} className="grid gap-3 sm:grid-cols-[1fr_120px_80px] items-center pb-3 border-b border-border last:border-0">
                    <div>
                      <Label className="text-sm font-medium">{f.display_name}</Label>
                      {f.description && <p className="text-xs text-muted-foreground">{f.description}</p>}
                    </div>
                    <div>
                      <Label className="text-xs">Peso</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={f.weight}
                        onChange={(e) => updateFactor(f.id, { weight: parseFloat(e.target.value) || 0 })}
                        className="h-8"
                      />
                    </div>
                    <div className="flex items-center justify-end">
                      <Switch checked={f.enabled} onCheckedChange={(v) => updateFactor(f.id, { enabled: v })} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};

export default UEBASettingsPage;
