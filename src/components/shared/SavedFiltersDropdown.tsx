// ============================================================
// SAVED FILTERS DROPDOWN COMPONENT
// Dropdown para gerenciar e aplicar filtros salvos
// ============================================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, Star, Trash2, Plus, Loader2 } from 'lucide-react';
import { useSavedFilters, type SavedFilter } from '@/hooks/useSavedFilters';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface SavedFiltersDropdownProps {
  entityType: string;
  currentFilters: Record<string, unknown>;
  onApplyFilter: (filters: Record<string, unknown>) => void;
  className?: string;
  disabled?: boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export function SavedFiltersDropdown({
  entityType,
  currentFilters,
  onApplyFilter,
  className,
  disabled = false,
}: SavedFiltersDropdownProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  const {
    filters,
    isLoading,
    saveFilter,
    deleteFilter,
    setDefault,
    isSaving,
    isDeleting,
  } = useSavedFilters({
    entityType,
    onApply: onApplyFilter,
  });

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;

    saveFilter({
      name: filterName.trim(),
      filters: currentFilters,
      is_default: setAsDefault,
    });

    setFilterName('');
    setSetAsDefault(false);
    setShowSaveDialog(false);
  };

  const handleApplyFilter = (filter: SavedFilter) => {
    onApplyFilter(filter.filters);
  };

  const handleDeleteFilter = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteFilter(id);
  };

  const handleSetDefault = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDefault(id);
  };

  // ============================================================
  // CHECK IF HAS ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters = Object.values(currentFilters).some(
    (v) => v !== undefined && v !== null && v !== ''
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('gap-2', className)}
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Filtros</span>
            {filters.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {filters.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Filtros Salvos</span>
            {filters.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {filters.length} salvo{filters.length !== 1 ? 's' : ''}
              </span>
            )}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Botão para salvar filtro atual */}
          <DropdownMenuItem
            onClick={() => setShowSaveDialog(true)}
            disabled={!hasActiveFilters}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Salvar Filtro Atual</span>
          </DropdownMenuItem>

          {filters.length > 0 && <DropdownMenuSeparator />}

          {/* Lista de filtros salvos */}
          {filters.map((filter) => (
            <DropdownMenuItem
              key={filter.id}
              className="flex items-center justify-between gap-2 cursor-pointer"
              onClick={() => handleApplyFilter(filter)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {filter.is_default && (
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                )}
                <span className="truncate">{filter.name}</span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                  onClick={(e) => handleSetDefault(e, filter.id)}
                  title="Definir como padrão"
                >
                  <Star
                    className={cn(
                      'h-3 w-3',
                      filter.is_default ? 'fill-yellow-500 text-yellow-500' : ''
                    )}
                  />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-destructive/10 text-destructive"
                  onClick={(e) => handleDeleteFilter(e, filter.id)}
                  disabled={isDeleting}
                  title="Remover filtro"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))}

          {/* Empty state */}
          {filters.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Nenhum filtro salvo.
              <br />
              <span className="text-xs">
                {hasActiveFilters
                  ? 'Clique em "Salvar Filtro Atual"'
                  : 'Aplique filtros e salve para uso futuro'}
              </span>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para salvar filtro */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar Filtro</DialogTitle>
            <DialogDescription>
              Dê um nome para este conjunto de filtros para reutilizá-lo depois.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Nome do Filtro</Label>
              <Input
                id="filter-name"
                placeholder="Ex: Ativos do mês"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter()}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="set-default"
                checked={setAsDefault}
                onCheckedChange={(checked) => setSetAsDefault(checked === true)}
              />
              <Label
                htmlFor="set-default"
                className="text-sm font-normal cursor-pointer"
              >
                Definir como filtro padrão
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveFilter}
              disabled={!filterName.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SavedFiltersDropdown;
