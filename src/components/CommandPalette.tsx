import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Users,
  Shield,
  Settings,
  FileText,
  AlertTriangle,
  Monitor,
  Clock,
  MapPin,
  Key,
  Webhook,
  MessageSquare,
  BarChart3,
  Search,
  Home,
  UserCog,
  Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  type: 'employee' | 'team' | 'violation' | 'page';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
}

// Páginas disponíveis para navegação
const pages: SearchResult[] = [
  { id: 'home', type: 'page', title: 'Dashboard', subtitle: 'Página inicial', icon: Home, action: () => {} },
  { id: 'employees', type: 'page', title: 'Funcionários', subtitle: 'Gerenciar funcionários', icon: Users, action: () => {} },
  { id: 'teams', type: 'page', title: 'Equipes', subtitle: 'Gerenciar equipes', icon: Users, action: () => {} },
  { id: 'violations', type: 'page', title: 'Violações', subtitle: 'Ver violações de segurança', icon: AlertTriangle, action: () => {} },
  { id: 'monitoring', type: 'page', title: 'Monitoramento', subtitle: 'Monitoramento em tempo real', icon: Monitor, action: () => {} },
  { id: 'devices', type: 'page', title: 'Dispositivos', subtitle: 'Gerenciar dispositivos', icon: Monitor, action: () => {} },
  { id: 'security', type: 'page', title: 'Segurança', subtitle: 'Central de segurança', icon: Shield, action: () => {} },
  { id: 'reports', type: 'page', title: 'Relatórios', subtitle: 'Gerar relatórios', icon: FileText, action: () => {} },
  { id: 'settings', type: 'page', title: 'Configurações', subtitle: 'Configurações do sistema', icon: Settings, action: () => {} },
  { id: 'violation-rules', type: 'page', title: 'Regras de Violação', subtitle: 'Configurar regras', icon: AlertTriangle, action: () => {} },
  { id: 'work-schedules', type: 'page', title: 'Jornadas de Trabalho', subtitle: 'Horários de trabalho', icon: Clock, action: () => {} },
  { id: 'geofencing', type: 'page', title: 'Geofencing', subtitle: 'Áreas permitidas', icon: MapPin, action: () => {} },
  { id: 'agent-keys', type: 'page', title: 'Chaves de Agente', subtitle: 'Gerenciar chaves', icon: Key, action: () => {} },
  { id: 'webhooks', type: 'page', title: 'Webhooks', subtitle: 'Integrações', icon: Webhook, action: () => {} },
  { id: 'whatsapp', type: 'page', title: 'WhatsApp', subtitle: 'Integração WhatsApp', icon: MessageSquare, action: () => {} },
  { id: 'user-management', type: 'page', title: 'Usuários', subtitle: 'Gerenciar usuários e roles', icon: UserCog, action: () => {} },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Atalho Ctrl+K ou Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Buscar funcionários
  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['search-employees', search],
    queryFn: async () => {
      if (search.length < 2) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, email, department')
        .or(`name.ilike.%${search}%,email.ilike.%${search}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: search.length >= 2 && open,
  });

  // Buscar violações
  const { data: violations, isLoading: loadingViolations } = useQuery({
    queryKey: ['search-violations', search],
    queryFn: async () => {
      if (search.length < 2) return [];
      
      const { data, error } = await supabase
        .from('security_violations')
        .select('id, employee_name, violation_type, severity')
        .or(`employee_name.ilike.%${search}%,violation_type.ilike.%${search}%`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: search.length >= 2 && open,
  });

  // Filtrar páginas pelo termo de busca
  const filteredPages = pages.filter(
    page =>
      page.title.toLowerCase().includes(search.toLowerCase()) ||
      page.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = useCallback((result: { type: string; id: string }) => {
    setOpen(false);
    setSearch('');

    switch (result.type) {
      case 'page':
        const route = result.id === 'home' ? '/' : `/${result.id}`;
        navigate(route);
        break;
      case 'employee':
        navigate(`/employee/${result.id}`);
        break;
      case 'violation':
        navigate(`/violations?highlight=${result.id}`);
        break;
    }
  }, [navigate]);

  const isLoading = loadingEmployees || loadingViolations;

  return (
    <>
      {/* Botão para abrir (opcional, também pode usar Ctrl+K) */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-lg hover:bg-accent transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Buscar...</span>
        <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar funcionários, páginas, violações..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}

          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          {/* Páginas */}
          {filteredPages.length > 0 && (
            <CommandGroup heading="Páginas">
              {filteredPages.slice(0, 6).map((page) => (
                <CommandItem
                  key={page.id}
                  value={`page-${page.id}`}
                  onSelect={() => handleSelect({ type: 'page', id: page.id })}
                >
                  <page.icon className="mr-2 h-4 w-4" />
                  <span>{page.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{page.subtitle}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Funcionários */}
          {employees && employees.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Funcionários">
                {employees.map((emp) => (
                  <CommandItem
                    key={emp.id}
                    value={`employee-${emp.id}`}
                    onSelect={() => handleSelect({ type: 'employee', id: emp.id })}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span>{emp.name}</span>
                    {emp.department && (
                      <span className="ml-2 text-xs text-muted-foreground">{emp.department}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Violações */}
          {violations && violations.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Violações">
                {violations.map((v) => (
                  <CommandItem
                    key={v.id}
                    value={`violation-${v.id}`}
                    onSelect={() => handleSelect({ type: 'violation', id: v.id })}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <span>{v.employee_name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{v.violation_type}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
