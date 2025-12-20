import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Star, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Check,
  Filter,
  Loader2
} from 'lucide-react';
import { useSavedFilters, SavedFilter } from '@/hooks/useSavedFilters';
import { cn } from '@/lib/utils';

interface SavedFiltersBarProps {
  module: string;
  currentFilters: Record<string, any>;
  onApplyFilter: (filters: Record<string, any>) => void;
  className?: string;
}

function SavedFiltersBarBase({
  module,
  currentFilters,
  onApplyFilter,
  className,
}: SavedFiltersBarProps) {
  const {
    filters,
    defaultFilter,
    isLoading,
    createFilter,
    deleteFilter,
    setAsDefault,
    useFilter,
  } = useSavedFilters(module);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const handleSaveFilter = () => {
    if (!newFilterName.trim()) return;
    
    createFilter.mutate({
      name: newFilterName,
      module,
      filters: currentFilters,
    }, {
      onSuccess: () => {
        setShowSaveDialog(false);
        setNewFilterName('');
      },
    });
  };

  const handleApplyFilter = (filter: SavedFilter) => {
    setSelectedFilter(filter.id);
    onApplyFilter(filter.filters);
    useFilter.mutate(filter.id);
  };

  const hasActiveFilters = Object.values(currentFilters).some(v => v !== '' && v !== null && v !== undefined);

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Filtros salvos */}
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center">
          <Button
            variant={selectedFilter === filter.id ? 'default' : 'outline'}
            size="sm"
            className="rounded-r-none"
            onClick={() => handleApplyFilter(filter)}
          >
            {filter.is_default && <Star className="h-3 w-3 mr-1 fill-current" />}
            {filter.name}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={selectedFilter === filter.id ? 'default' : 'outline'} 
                size="sm" 
                className="rounded-l-none border-l-0 px-2"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!filter.is_default && (
                <DropdownMenuItem onClick={() => setAsDefault.mutate(filter.id)}>
                  <Star className="h-4 w-4 mr-2" />
                  Definir como padrão
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => deleteFilter.mutate(filter.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      {/* Botão para salvar filtro atual */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSaveDialog(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Salvar filtro
        </Button>
      )}

      {/* Limpar seleção */}
      {selectedFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedFilter(null);
            onApplyFilter({});
          }}
        >
          Limpar
        </Button>
      )}

      {/* Dialog para salvar novo filtro */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Filtro</DialogTitle>
            <DialogDescription>
              Salve a combinação atual de filtros para uso rápido.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do filtro</label>
              <Input
                placeholder="Ex: Funcionários ativos do RH"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
              />
            </div>

            <div className="p-3 rounded-lg bg-muted">
              <h4 className="text-sm font-medium mb-2">Filtros incluídos:</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(currentFilters)
                  .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
                  .map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveFilter}
              disabled={!newFilterName.trim() || createFilter.isPending}
            >
              {createFilter.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Memo wrappers
export const SavedFiltersBar = memo(SavedFiltersBarBase);
