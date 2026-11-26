import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Activity,
  Monitor,
  Timer,
  FolderKanban,
  ClipboardList,
  UserCheck,
  BarChart,
  Shield,
  Bell,
  Camera,
  Globe,
  BarChart3,
  FileText,
  Brain,
  Building2,
  Calendar,
  Clock,
  Gamepad2,
  UserCog,
  ScrollText,
  Download,
  Webhook,
  Settings,
  Key,
  Loader2,
} from "lucide-react";
import { PATH_BY_RESULT_TYPE, useCommandSearch } from "@/hooks/useCommandSearch";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commandGroups = [
  {
    heading: "Principal",
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      { icon: Users, label: "Funcionários", path: "/employees" },
      { icon: Activity, label: "Atividades", path: "/activities" },
      { icon: Monitor, label: "Monitoramento", path: "/monitoring" },
    ],
  },
  {
    heading: "Ponto & Horas",
    items: [
      { icon: Timer, label: "Ponto Digital", path: "/time-clock" },
      { icon: FolderKanban, label: "Projetos & Tarefas", path: "/projects" },
      { icon: ClipboardList, label: "Folhas de Ponto", path: "/timesheets" },
      { icon: UserCheck, label: "Assiduidade", path: "/attendance" },
      { icon: BarChart, label: "Tracking de Horas", path: "/hours-tracking" },
    ],
  },
  {
    heading: "Segurança",
    items: [
      { icon: Shield, label: "Violações", path: "/violations" },
      { icon: Bell, label: "Alertas", path: "/alerts" },
      { icon: Camera, label: "Screenshots", path: "/screenshots" },
      { icon: Globe, label: "Acesso Internet", path: "/internet-access" },
    ],
  },
  {
    heading: "Análises",
    items: [
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
      { icon: FileText, label: "Relatórios", path: "/reports" },
      { icon: Brain, label: "Análise IA", path: "/ai-analysis" },
      { icon: Brain, label: "Recomendações IA", path: "/ai/recommendations" },
      { icon: BarChart3, label: "Previsão de Tendências", path: "/ai/trends" },
    ],
  },
  {
    heading: "Organização",
    items: [
      { icon: Building2, label: "Departamentos", path: "/admin/departments" },
      { icon: Users, label: "Equipes", path: "/admin/teams" },
      { icon: Calendar, label: "Calendário", path: "/calendar" },
      { icon: Clock, label: "Horários", path: "/work-schedules" },
      { icon: Gamepad2, label: "Gamificação", path: "/gamification" },
    ],
  },
  {
    heading: "Administração",
    items: [
      { icon: UserCog, label: "Usuários", path: "/admin/users" },
      { icon: Shield, label: "Papéis", path: "/admin/roles" },
      { icon: ScrollText, label: "Auditoria", path: "/admin/audit" },
      { icon: Download, label: "Exportação", path: "/export" },
    ],
  },
  {
    heading: "Configurações",
    items: [
      { icon: Settings, label: "Configurações", path: "/settings" },
      { icon: Key, label: "Chaves API", path: "/settings/api" },
      { icon: Webhook, label: "Integrações", path: "/integrations" },
    ],
  },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { results, loading } = useCommandSearch(query);

  const handleSelect = useCallback(
    (path: string) => {
      onOpenChange(false);
      setQuery("");
      navigate(path);
    },
    [navigate, onOpenChange]
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) setQuery("");
      onOpenChange(next);
    },
    [onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Buscar página, ação ou funcionário..."
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        {results.length > 0 && (
          <>
            <CommandGroup heading="Funcionários, violações e atividades">
              {results.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={`${result.type} ${result.title} ${result.description}`}
                  onSelect={() => handleSelect(PATH_BY_RESULT_TYPE[result.type](result.id))}
                  className="cursor-pointer gap-2"
                >
                  <Activity className="text-muted-foreground h-4 w-4" />
                  <span>{result.title}</span>
                  {result.description && (
                    <span className="text-muted-foreground truncate text-xs">
                      {result.description}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        {loading && (
          <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Buscando em funcionários, violações e atividades...</span>
          </div>
        )}
        {commandGroups.map((group, i) => (
          <div key={group.heading}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.path}
                  onSelect={() => handleSelect(item.path)}
                  className="cursor-pointer gap-2"
                >
                  <item.icon className="text-muted-foreground h-4 w-4" />
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
