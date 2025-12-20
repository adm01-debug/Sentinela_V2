import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  usage_count: number;
}

interface TemplatesListProps {
  templates: MessageTemplate[];
  categories: Array<{ value: string; label: string }>;
  onEdit: (template: MessageTemplate) => void;
  onDelete: (template: MessageTemplate) => void;
  onToggleStatus: (template: MessageTemplate) => void;
  onCopy?: (template: MessageTemplate) => void;
  onPreview?: (template: MessageTemplate) => void;
}

function TemplatesListComponent({
  templates,
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
  onCopy,
  onPreview,
}: TemplatesListProps) {
  const getCategoryLabel = (value: string) => {
    return categories.find(c => c.value === value)?.label || value;
  };

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Nenhum template encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium line-clamp-1">
                {template.name}
              </CardTitle>
              <CardDescription className="text-xs">
                {formatDistanceToNow(new Date(template.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onPreview && (
                  <DropdownMenuItem onClick={() => onPreview(template)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onEdit(template)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                {onCopy && (
                  <DropdownMenuItem onClick={() => onCopy(template)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(template)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent className="flex-1 space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {template.content}
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{getCategoryLabel(template.category)}</Badge>
              {template.variables?.length > 0 && (
                <Badge variant="secondary">
                  {template.variables.length} variáveis
                </Badge>
              )}
              {template.usage_count > 0 && (
                <Badge variant="secondary">
                  {template.usage_count} usos
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                {template.is_active ? 'Ativo' : 'Inativo'}
              </span>
              <Switch
                checked={template.is_active}
                onCheckedChange={() => onToggleStatus(template)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const TemplatesList = memo(TemplatesListComponent);
