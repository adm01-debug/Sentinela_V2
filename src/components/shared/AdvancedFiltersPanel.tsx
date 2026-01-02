// ============================================================
// ADVANCED FILTERS PANEL COMPONENT
// Painel de filtros avançados com múltiplos critérios
// ============================================================

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Filter,
  Plus,
  Trash2,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  useAdvancedFilters,
  OPERATOR_LABELS,
  type FilterField,
  type FilterGroup,
  type FilterOperator,
} from '@/hooks/useAdvancedFilters';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface AdvancedFiltersPanelProps {
  fields: FilterField[];
  onApply: (filters: FilterGroup[]) => void;
  initialFilters?: FilterGroup[];
  trigger?: React.ReactNode;
  className?: string;
}

// ============================================================
// CONDITION ROW COMPONENT
// ============================================================

interface ConditionRowProps {
  condition: FilterGroup['conditions'][0];
  fields: FilterField[];
  operators: FilterOperator[];
  onUpdate: (updates: Partial<FilterGroup['conditions'][0]>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function ConditionRow({
  condition,
  fields,
  operators,
  onUpdate,
  onRemove,
  canRemove,
}: ConditionRowProps) {
  const selectedField = fields.find((f) => f.key === condition.field);
  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
  const needsSecondValue = condition.operator === 'between';

  return (
    <div className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
      {/* Campo */}
      <Select
        value={condition.field}
        onValueChange={(value) => onUpdate({ field: value })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Campo" />
        </SelectTrigger>
        <SelectContent>
          {fields.map((field) => (
            <SelectItem key={field.key} value={field.key}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Operador */}
      <Select
        value={condition.operator}
        onValueChange={(value) => onUpdate({ operator: value as FilterOperator })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Operador" />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Valor */}
      {needsValue && (
        <>
          {selectedField?.type === 'select' || selectedField?.type === 'multi_select' ? (
            <Select
              value={String(condition.value ?? '')}
              onValueChange={(value) => onUpdate({ value })}
            >
              <SelectTrigger className="flex-1 min-w-[120px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {selectedField.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : selectedField?.type === 'boolean' ? (
            <Select
              value={String(condition.value ?? '')}
              onValueChange={(value) => onUpdate({ value: value === 'true' })}
            >
              <SelectTrigger className="flex-1 min-w-[120px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          ) : selectedField?.type === 'date' ? (
            <Input
              type="date"
              value={String(condition.value ?? '')}
              onChange={(e) => onUpdate({ value: e.target.value })}
              className="flex-1 min-w-[140px]"
            />
          ) : selectedField?.type === 'number' ? (
            <Input
              type="number"
              value={String(condition.value ?? '')}
              onChange={(e) => onUpdate({ value: e.target.value ? Number(e.target.value) : '' })}
              placeholder="Valor"
              className="flex-1 min-w-[100px]"
            />
          ) : (
            <Input
              type="text"
              value={String(condition.value ?? '')}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder="Valor"
              className="flex-1 min-w-[120px]"
            />
          )}

          {/* Segundo valor (between) */}
          {needsSecondValue && (
            <>
              <span className="text-sm text-muted-foreground self-center">e</span>
              <Input
                type={selectedField?.type === 'date' ? 'date' : selectedField?.type === 'number' ? 'number' : 'text'}
                value={String(condition.value2 ?? '')}
                onChange={(e) => onUpdate({ value2: e.target.value })}
                placeholder="Valor 2"
                className="flex-1 min-w-[100px]"
              />
            </>
          )}
        </>
      )}

      {/* Remover */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove}
        className="h-9 w-9 text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ============================================================
// FILTER GROUP COMPONENT
// ============================================================

interface FilterGroupComponentProps {
  group: FilterGroup;
  fields: FilterField[];
  getOperators: (fieldKey: string) => FilterOperator[];
  onAddCondition: () => void;
  onRemoveCondition: (conditionId: string) => void;
  onUpdateCondition: (conditionId: string, updates: Partial<FilterGroup['conditions'][0]>) => void;
  onUpdateLogic: (logic: 'AND' | 'OR') => void;
  onRemoveGroup: () => void;
  canRemove: boolean;
  groupIndex: number;
}

function FilterGroupComponent({
  group,
  fields,
  getOperators,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition,
  onUpdateLogic,
  onRemoveGroup,
  canRemove,
  groupIndex,
}: FilterGroupComponentProps) {
  return (
    <div className="border rounded-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Grupo {groupIndex + 1}</Badge>
          <div className="flex items-center gap-2">
            <Label htmlFor={`logic-${group.id}`} className="text-xs">
              Combinar com:
            </Label>
            <Select
              value={group.logic}
              onValueChange={(v) => onUpdateLogic(v as 'AND' | 'OR')}
            >
              <SelectTrigger className="h-7 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">E</SelectItem>
                <SelectItem value="OR">OU</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveGroup}
            className="h-7 text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remover
          </Button>
        )}
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        {group.conditions.map((condition, idx) => (
          <div key={condition.id}>
            {idx > 0 && (
              <div className="flex items-center gap-2 py-1">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground uppercase">
                  {group.logic === 'AND' ? 'e' : 'ou'}
                </span>
                <Separator className="flex-1" />
              </div>
            )}
            <ConditionRow
              condition={condition}
              fields={fields}
              operators={getOperators(condition.field)}
              onUpdate={(updates) => onUpdateCondition(condition.id, updates)}
              onRemove={() => onRemoveCondition(condition.id)}
              canRemove={group.conditions.length > 1}
            />
          </div>
        ))}
      </div>

      {/* Add condition */}
      <Button
        variant="outline"
        size="sm"
        onClick={onAddCondition}
        className="w-full gap-2"
      >
        <Plus className="h-3 w-3" />
        Adicionar Condição
      </Button>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AdvancedFiltersPanel({
  fields,
  onApply,
  initialFilters,
  trigger,
  className,
}: AdvancedFiltersPanelProps) {
  const {
    filterGroups,
    hasActiveFilters,
    addGroup,
    removeGroup,
    updateGroupLogic,
    addCondition,
    removeCondition,
    updateCondition,
    resetFilters,
    getOperatorsForField,
  } = useAdvancedFilters({
    fields,
    initialFilters,
    onChange: onApply,
  });

  const activeCount = filterGroups.reduce(
    (acc, g) => acc + g.conditions.filter((c) => c.value || ['is_empty', 'is_not_empty'].includes(c.operator)).length,
    0
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className={cn('gap-2', className)}>
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {activeCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="w-[450px] sm:w-[540px] sm:max-w-none">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </SheetTitle>
          <SheetDescription>
            Combine múltiplos critérios para filtrar os dados
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] mt-6 pr-4">
          <div className="space-y-4">
            {filterGroups.map((group, idx) => (
              <div key={group.id}>
                {idx > 0 && (
                  <div className="flex items-center gap-2 py-2">
                    <Separator className="flex-1" />
                    <Badge variant="outline">OU</Badge>
                    <Separator className="flex-1" />
                  </div>
                )}
                <FilterGroupComponent
                  group={group}
                  fields={fields}
                  getOperators={getOperatorsForField}
                  onAddCondition={() => addCondition(group.id)}
                  onRemoveCondition={(cId) => removeCondition(group.id, cId)}
                  onUpdateCondition={(cId, updates) => updateCondition(group.id, cId, updates)}
                  onUpdateLogic={(logic) => updateGroupLogic(group.id, logic)}
                  onRemoveGroup={() => removeGroup(group.id)}
                  canRemove={filterGroups.length > 1}
                  groupIndex={idx}
                />
              </div>
            ))}

            <Button
              variant="dashed"
              onClick={addGroup}
              className="w-full gap-2 border-dashed"
            >
              <Plus className="h-4 w-4" />
              Adicionar Grupo (OU)
            </Button>
          </div>
        </ScrollArea>

        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={resetFilters} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Limpar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default AdvancedFiltersPanel;
