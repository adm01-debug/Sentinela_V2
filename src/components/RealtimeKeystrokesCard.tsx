import { Keyboard, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KeystrokeDetail {
  id: string;
  employee_name: string;
  key_pressed: string;
  app_name: string | null;
  window_title: string | null;
  device: string | null;
  recorded_at: string;
  is_sensitive: boolean | null;
}

interface RealtimeKeystrokesCardProps {
  keystrokes: KeystrokeDetail[];
}

export const RealtimeKeystrokesCard = ({ keystrokes }: RealtimeKeystrokesCardProps) => {
  const formatKey = (key: string) => {
    const specialKeys: Record<string, string> = {
      ' ': '␣',
      'Enter': '↵',
      'Backspace': '⌫',
      'Tab': '⇥',
      'Escape': 'Esc',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
    };
    return specialKeys[key] || key;
  };

  return (
    <Card className="h-[500px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Keyboard className="h-5 w-5 text-primary" />
          Teclas Digitadas em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {keystrokes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Keyboard className="h-12 w-12 mb-2 opacity-50" />
              <p>Nenhuma tecla registrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {keystrokes.map((keystroke) => (
                <div
                  key={keystroke.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Badge
                    variant="outline"
                    className="font-mono min-w-[40px] justify-center text-base"
                  >
                    {formatKey(keystroke.key_pressed)}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">
                        {keystroke.employee_name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {keystroke.app_name || keystroke.window_title || 'Desconhecido'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(keystroke.recorded_at), 'HH:mm:ss', { locale: ptBR })}
                  </div>
                  {keystroke.is_sensitive && (
                    <Badge variant="destructive" className="text-xs">
                      Sensível
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
