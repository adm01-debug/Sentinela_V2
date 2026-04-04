import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Users, Activity, Monitor, Timer, FolderKanban, ClipboardList,
  UserCheck, BarChart, Shield, Bell, Camera, Globe, BarChart3, FileText,
  Brain, Smartphone, MapPin, Building2, Calendar, Clock, Gamepad2,
  UserCog, ScrollText, Download, Webhook, MessageSquare, Settings, Key
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commandGroups = [
  {
    heading: 'Principal',
    items: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'Funcionários', path: '/employees' },
      { icon: Activity, label: 'Atividades', path: '/activities' },
      { icon: Monitor, label: 'Monitoramento', path: '/monitoring' },
    ],
  },
  {
    heading: 'Ponto & Horas',
    items: [
      { icon: Timer, label: 'Ponto Digital', path: '/time-clock' },
      { icon: FolderKanban, label: 'Projetos & Tarefas', path: '/projects' },
      { icon: ClipboardList, label: 'Folhas de Ponto', path: '/timesheets' },
      { icon: UserCheck, label: 'Assiduidade', path: '/attendance' },
      { icon: BarChart, label: 'Tracking de Horas', path: '/hours-tracking' },
    ],
  },
  {
    heading: 'Segurança',
    items: [
      { icon: Shield, label: 'Violações', path: '/violations' },
      { icon: Bell, label: 'Alertas', path: '/alerts' },
      { icon: Camera, label: 'Screenshots', path: '/screenshots' },
      { icon: Globe, label: 'Acesso Internet', path: '/internet-access' },
    ],
  },
  {
    heading: 'Análises',
    items: [
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
      { icon: FileText, label: 'Relatórios', path: '/reports' },
      { icon: Brain, label: 'Análise IA', path: '/ai-analysis' },
    ],
  },
  {
    heading: 'Organização',
    items: [
      { icon: Building2, label: 'Departamentos', path: '/admin/departments' },
      { icon: Users, label: 'Equipes', path: '/admin/teams' },
      { icon: Calendar, label: 'Calendário', path: '/calendar' },
      { icon: Clock, label: 'Horários', path: '/work-schedules' },
      { icon: Gamepad2, label: 'Gamificação', path: '/gamification' },
    ],
  },
  {
    heading: 'Administração',
    items: [
      { icon: UserCog, label: 'Usuários', path: '/admin/users' },
      { icon: Shield, label: 'Papéis', path: '/admin/roles' },
      { icon: ScrollText, label: 'Auditoria', path: '/admin/audit' },
      { icon: Download, label: 'Exportação', path: '/export' },
    ],
  },
  {
    heading: 'Configurações',
    items: [
      { icon: Settings, label: 'Configurações', path: '/settings' },
      { icon: Key, label: 'Chaves API', path: '/settings/api' },
      { icon: Webhook, label: 'Integrações', path: '/integrations' },
    ],
  },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  const handleSelect = useCallback(
    (path) => {
      onOpenChange(false);
      navigate(path);
    },
    [navigate, onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar página, ação ou funcionário..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        {commandGroups.map((group, i) => (
          <div key={group.heading}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.path}
                  onSelect={() => handleSelect(item.path)}
                  className="gap-2 cursor-pointer"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
