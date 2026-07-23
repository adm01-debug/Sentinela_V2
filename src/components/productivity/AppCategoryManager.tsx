import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useAppCategories, type ProductivityCategory, type AppType } from '@/hooks/useAppCategories';
import { useToast } from '@/hooks/use-toast';

const CATEGORY_LABEL: Record<ProductivityCategory, string> = {
  productive: 'Produtivo',
  neutral: 'Neutro',
  unproductive: 'Improdutivo',
};

const CATEGORY_VARIANT: Record<ProductivityCategory, 'default' | 'secondary' | 'destructive'> = {
  productive: 'default',
  neutral: 'secondary',
  unproductive: 'destructive',
};

export function AppCategoryManager() {
  const { categories, isLoading, upsert, remove } = useAppCategories();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [newApp, setNewApp] = useState('');
  const [newType, setNewType] = useState<AppType>('application');
  const [newCategory, setNewCategory] = useState<ProductivityCategory>('productive');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.app_identifier.toLowerCase().includes(q) ||
        (c.display_name?.toLowerCase().includes(q) ?? false),
    );
  }, [categories, search]);

  const handleAdd = async () => {
    const id = newApp.trim();
    if (!id) return;
    try {
      await upsert.mutateAsync({ app_identifier: id, app_type: newType, category: newCategory });
      setNewApp('');
      toast({ title: 'Aplicação categorizada', description: id });
    } catch (e) {
      toast({ title: 'Erro ao salvar', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleUpdate = async (
    appId: string,
    appType: AppType,
    category: ProductivityCategory,
    displayName: string | null,
  ) => {
    try {
      await upsert.mutateAsync({
        app_identifier: appId,
        app_type: appType,
        category,
        display_name: displayName,
      });
    } catch (e) {
      toast({ title: 'Erro ao atualizar', description: (e as Error).message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorização de Aplicações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-[1fr_140px_160px_auto]">
          <Input
            aria-label="Aplicação ou domínio"
            placeholder="ex.: chrome.exe ou instagram.com"
            value={newApp}
            onChange={(e) => setNewApp(e.target.value)}
          />
          <Select value={newType} onValueChange={(v) => setNewType(v as AppType)}>
            <SelectTrigger aria-label="Tipo"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="application">Aplicação</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="domain">Domínio</SelectItem>
            </SelectContent>
          </Select>
          <Select value={newCategory} onValueChange={(v) => setNewCategory(v as ProductivityCategory)}>
            <SelectTrigger aria-label="Categoria"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="productive">Produtivo</SelectItem>
              <SelectItem value="neutral">Neutro</SelectItem>
              <SelectItem value="unproductive">Improdutivo</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={upsert.isPending || !newApp.trim()}>
            {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Adicionar
          </Button>
        </div>

        <Input
          aria-label="Buscar categoria"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.app_identifier}</TableCell>
                    <TableCell><Badge variant="outline">{c.app_type}</Badge></TableCell>
                    <TableCell>
                      <Select
                        value={c.category}
                        onValueChange={(v) =>
                          handleUpdate(c.app_identifier, c.app_type, v as ProductivityCategory, c.display_name)
                        }
                      >
                        <SelectTrigger className="w-40" aria-label={`Categoria de ${c.app_identifier}`}>
                          <SelectValue>
                            <Badge variant={CATEGORY_VARIANT[c.category]}>{CATEGORY_LABEL[c.category]}</Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="productive">Produtivo</SelectItem>
                          <SelectItem value="neutral">Neutro</SelectItem>
                          <SelectItem value="unproductive">Improdutivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Remover ${c.app_identifier}`}
                        onClick={() => remove.mutate(c.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
