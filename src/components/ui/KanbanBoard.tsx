import * as React from 'react';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Plus, MoreHorizontal, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  labels?: { text: string; color: string }[];
  assignee?: { name: string; avatar?: string };
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
  limit?: number;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string, position: number) => void;
  onCardClick?: (card: KanbanCard, columnId: string) => void;
  onAddCard?: (columnId: string) => void;
  onColumnMenu?: (columnId: string) => void;
  className?: string;
  renderCard?: (card: KanbanCard) => React.ReactNode;
}

const priorityColors = { low: 'bg-blue-100 text-blue-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800' };

export function KanbanBoard({ columns, onCardMove, onCardClick, onAddCard, onColumnMenu, className, renderCard }: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; columnId: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = useCallback((cardId: string, columnId: string) => {
    setDraggedCard({ cardId, columnId });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toColumnId: string) => {
    e.preventDefault();
    if (draggedCard && draggedCard.columnId !== toColumnId) {
      onCardMove?.(draggedCard.cardId, draggedCard.columnId, toColumnId, 0);
    }
    setDraggedCard(null);
    setDragOverColumn(null);
  }, [draggedCard, onCardMove]);

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
    setDragOverColumn(null);
  }, []);

  const DefaultCard = ({ card }: { card: KanbanCard }) => (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">{card.title}</h4>
      {card.description && <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>}
      <div className="flex flex-wrap gap-1">
        {card.labels?.map((label, i) => <Badge key={i} style={{ backgroundColor: label.color }} className="text-white text-xs">{label.text}</Badge>)}
        {card.priority && <Badge className={priorityColors[card.priority]}>{card.priority}</Badge>}
      </div>
      {(card.assignee || card.dueDate) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {card.assignee && <span>{card.assignee.name}</span>}
          {card.dueDate && <span>{card.dueDate.toLocaleDateString()}</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map(column => (
        <div key={column.id} className="flex-shrink-0 w-72" onDragOver={e => handleDragOver(e, column.id)} onDrop={e => handleDrop(e, column.id)}>
          <Card className={cn('h-full', dragOverColumn === column.id && 'ring-2 ring-primary')}>
            <CardHeader className="py-3 px-4" style={{ borderTop: `3px solid ${column.color || '#6366f1'}` }}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">{column.title}<Badge variant="secondary" className="text-xs">{column.cards.length}{column.limit && `/${column.limit}`}</Badge></CardTitle>
                <div className="flex gap-1">
                  {onAddCard && <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onAddCard(column.id)}><Plus className="h-4 w-4" /></Button>}
                  {onColumnMenu && <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onColumnMenu(column.id)}><MoreHorizontal className="h-4 w-4" /></Button>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-2 min-h-[200px]">
              {column.cards.map(card => (
                <Card key={card.id} className="cursor-pointer hover:shadow-md transition-shadow" draggable onDragStart={() => handleDragStart(card.id, column.id)} onDragEnd={handleDragEnd} onClick={() => onCardClick?.(card, column.id)}>
                  <CardContent className="p-3">
                    <div className="flex gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />
                      <div className="flex-1">{renderCard ? renderCard(card) : <DefaultCard card={card} />}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
export default KanbanBoard;
