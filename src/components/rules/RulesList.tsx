import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Activity } from 'lucide-react';

interface ViolationRule {
  id: string;
  name: string;
  description?: string;
  type: string;
  severity: string;
  is_active: boolean;
  triggered_count: number;
}

interface RulesListProps {
  rules: ViolationRule[];
  ruleTypes: Array<{ value: string; label: string }>;
  onEdit: (rule: ViolationRule) => void;
  onDelete: (rule: ViolationRule) => void;
  onToggle: (rule: ViolationRule) => void;
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

function RulesListComponent({ rules, ruleTypes, onEdit, onDelete, onToggle }: RulesListProps) {
  const getTypeLabel = (type: string) => ruleTypes.find(t => t.value === type)?.label || type;

  if (rules.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma regra encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <Card key={rule.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-8 rounded-full ${severityColors[rule.severity]}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{rule.name}</p>
                    <Badge variant="outline">{getTypeLabel(rule.type)}</Badge>
                  </div>
                  {rule.description && (
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{rule.triggered_count}</p>
                  <p className="text-xs text-muted-foreground">acionamentos</p>
                </div>

                <Switch checked={rule.is_active} onCheckedChange={() => onToggle(rule)} />

                <Button variant="ghost" size="icon" onClick={() => onEdit(rule)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(rule)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const RulesList = memo(RulesListComponent);
