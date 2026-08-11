import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categoryLabels } from '@/data/settingsData';
import type { ApplicationRule } from '@/hooks/useSettings';

interface EditApplicationDialogProps {
  rule: ApplicationRule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, name: string, category: ApplicationRule['category']) => Promise<boolean>;
}

export function EditApplicationDialog({ rule, open, onOpenChange, onSave }: EditApplicationDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ApplicationRule['category']>('other');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setCategory(rule.category);
    }
  }, [rule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rule || !name.trim()) return;

    setLoading(true);
    const success = await onSave(rule.id, name.trim(), category);
    setLoading(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Aplicativo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome do Aplicativo</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Google Chrome"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ApplicationRule['category'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="productivity">{categoryLabels.productivity}</SelectItem>
                <SelectItem value="communication">{categoryLabels.communication}</SelectItem>
                <SelectItem value="entertainment">{categoryLabels.entertainment}</SelectItem>
                <SelectItem value="development">{categoryLabels.development}</SelectItem>
                <SelectItem value="other">{categoryLabels.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
