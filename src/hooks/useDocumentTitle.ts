import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/employees': 'Funcionários',
  '/activities': 'Atividades',
  '/analytics': 'Análises',
  '/reports': 'Relatórios',
  '/alerts': 'Alertas',
  '/monitoring': 'Monitoramento',
  '/violations': 'Violações',
  '/settings': 'Configurações',
  '/devices': 'Dispositivos',
  '/teams': 'Equipes',
  '/departments': 'Departamentos',
  '/screenshots': 'Capturas de Tela',
  '/geofencing': 'Geofencing',
  '/work-schedules': 'Horários de Trabalho',
  '/compliance': 'Conformidade',
  '/ai-analysis': 'Análise IA',
  '/gamification': 'Gamificação',
  '/time-clock': 'Ponto Eletrônico',
  '/projects': 'Projetos',
  '/timesheets': 'Planilhas de Horas',
  '/attendance': 'Frequência',
  '/hours-tracking': 'Controle de Horas',
};

const BASE_TITLE = 'Sentinela';

/**
 * Auto-sets document title based on current route.
 * Pass a custom title to override.
 */
export function useDocumentTitle(customTitle?: string): void {
  const location = useLocation();

  useEffect(() => {
    const routeTitle = customTitle ?? ROUTE_TITLES[location.pathname];
    document.title = routeTitle ? `${routeTitle} | ${BASE_TITLE}` : BASE_TITLE;
  }, [location.pathname, customTitle]);
}
