import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import type { ApplicationRule } from '@/hooks/useSettings';
import { categoryLabels, statusLabels } from '@/data/settingsData';

const statusStyles = {
  allowed: 'bg-success/20 text-success border-success/30',
  blocked: 'bg-destructive/20 text-destructive border-destructive/30',
  monitored: 'bg-warning/20 text-warning border-warning/30',
};

const appIcons: Record<string, string> = {
  'VS Code': '💻',
  'Chrome': '🌐',
  'Slack': '💬',
  'Discord': '🎮',
  'Spotify': '🎵',
  'Netflix': '📺',
  'WhatsApp': '📱',
  'Telegram': '✈️',
  'Excel': '📊',
  'Word': '📝',
  'Figma': '🎨',
  'YouTube': '▶️',
  'Steam': '🎮',
  'Zoom': '📹',
  'Teams': '👥',
};

interface ApplicationRuleRowProps {
  rule: ApplicationRule;
  onStatusChange: (id: string, status: 'allowed' | 'blocked' | 'monitored') => void;
  onDelete?: (id: string) => Promise<boolean>;
}

export function ApplicationRuleRow({ rule, onStatusChange, onDelete }: ApplicationRuleRowProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    await onDelete(rule.id);
    setDeleting(false);
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-xl">
          {appIcons[rule.name] || '📦'}
        </div>
        <div>
          <p className="font-medium">{rule.name}</p>
          <Badge variant="outline" className="text-xs">
            {categoryLabels[rule.category]}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Select
          value={rule.status}
          onValueChange={(value) => onStatusChange(rule.id, value as 'allowed' | 'blocked' | 'monitored')}
        >
          <SelectTrigger className={cn('w-36', statusStyles[rule.status])}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="allowed" className="text-success">
              {statusLabels.allowed}
            </SelectItem>
            <SelectItem value="monitored" className="text-warning">
              {statusLabels.monitored}
            </SelectItem>
            <SelectItem value="blocked" className="text-destructive">
              {statusLabels.blocked}
            </SelectItem>
          </SelectContent>
        </Select>

        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir aplicativo</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir "{rule.name}" da lista de regras? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
