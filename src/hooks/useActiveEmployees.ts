import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActiveEmployee {
  id: string;
  name: string;
  email: string | null;
  department: string | null;
  avatar: string;
  status: 'online' | 'offline' | 'idle';
  device: 'desktop' | 'mobile';
  lastActivity: string;
  productivityScore: number;
}

async function fetchActiveEmployees(): Promise<ActiveEmployee[]> {
  // Buscar funcionários com seus dispositivos e última atividade
  const { data: employees, error } = await supabase
    .from('employees')
    .select(`
      id,
      name,
      email,
      department,
      status,
      employee_devices (
        device_type,
        is_active,
        last_activity_at
      )
    `)
    .eq('status', 'active')
    .limit(20);

  if (error) {
    console.error('Erro ao buscar funcionários:', error);
    throw error;
  }

  // Buscar produtividade dos funcionários (média da última hora)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: productivityData } = await supabase
    .from('productivity_logs')
    .select('employee_id, productivity_score')
    .gte('created_at', oneHourAgo);

  // Calcular média de produtividade por funcionário
  const productivityMap = new Map<string, number[]>();
  productivityData?.forEach(p => {
    const scores = productivityMap.get(p.employee_id) || [];
    scores.push(p.productivity_score || 0);
    productivityMap.set(p.employee_id, scores);
  });

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  return (employees || []).map(emp => {
    const devices = emp.employee_devices || [];
    const primaryDevice = devices[0];
    
    // Determinar status baseado na última atividade
    let status: 'online' | 'offline' | 'idle' = 'offline';
    let lastActivityDate: Date | null = null;
    
    if (primaryDevice?.last_activity_at) {
      lastActivityDate = new Date(primaryDevice.last_activity_at);
      if (lastActivityDate > fiveMinutesAgo) {
        status = 'online';
      } else if (lastActivityDate > fifteenMinutesAgo) {
        status = 'idle';
      }
    }

    // Calcular produtividade média
    const scores = productivityMap.get(emp.id) || [];
    const avgProductivity = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Formatar última atividade
    let lastActivity = 'Sem atividade';
    if (lastActivityDate) {
      const diffMs = Date.now() - lastActivityDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) lastActivity = 'Agora';
      else if (diffMins < 60) lastActivity = `${diffMins} min atrás`;
      else lastActivity = `${Math.floor(diffMins / 60)} horas atrás`;
    }

    // Gerar avatar (iniciais)
    const avatar = emp.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      avatar,
      status,
      device: (primaryDevice?.device_type === 'mobile' ? 'mobile' : 'desktop') as 'desktop' | 'mobile',
      lastActivity,
      productivityScore: avgProductivity
    };
  }).sort((a, b) => {
    // Ordenar: online primeiro, depois idle, depois offline
    const statusOrder = { online: 0, idle: 1, offline: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
}

export function useActiveEmployees() {
  return useQuery({
    queryKey: ['active-employees'],
    queryFn: fetchActiveEmployees,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
