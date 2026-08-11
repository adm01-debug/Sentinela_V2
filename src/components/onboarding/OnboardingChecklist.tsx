import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, X } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Step {
  id: string;
  title: string;
  description: string;
  to: string;
}

const STEPS: Step[] = [
  { id: 'invite', title: 'Convidar colaboradores', description: 'Adicione sua equipe ao sistema.', to: '/employees' },
  { id: 'agent', title: 'Instalar o agente desktop', description: 'Baixe e distribua o agente para as estações.', to: '/devices' },
  { id: 'schedule', title: 'Definir jornadas de trabalho', description: 'Configure horários e regras de hora extra.', to: '/work-schedules' },
  { id: 'alerts', title: 'Configurar alertas', description: 'Ative notificações de violações e eventos críticos.', to: '/alerts/rules' },
];

interface State {
  completed: string[];
  dismissed: boolean;
}

const DEFAULT: State = { completed: [], dismissed: false };

export function OnboardingChecklist() {
  const [state, setState] = useLocalStorage<State>('sentinela.onboarding', DEFAULT);

  const progress = useMemo(
    () => Math.round((state.completed.length / STEPS.length) * 100),
    [state.completed.length],
  );

  if (state.dismissed || progress === 100) return null;

  const toggle = (id: string) => {
    const set = new Set(state.completed);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    setState({ ...state, completed: Array.from(set) });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Comece em 4 passos</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {state.completed.length} de {STEPS.length} concluídos
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Dispensar checklist"
          onClick={() => setState({ ...state, dismissed: true })}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" aria-label={`Progresso ${progress}%`} />
        <ol className="space-y-2">
          {STEPS.map((step, i) => {
            const done = state.completed.includes(step.id);
            return (
              <li
                key={step.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <button
                  type="button"
                  aria-label={done ? `Desmarcar ${step.title}` : `Marcar ${step.title} como concluído`}
                  onClick={() => toggle(step.id)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    done
                      ? 'border-success bg-success text-success-foreground'
                      : 'border-muted-foreground'
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">{i + 1}</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? 'line-through text-muted-foreground' : ''}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to={step.to} aria-label={`Ir para ${step.title}`}>
                    Ir <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
