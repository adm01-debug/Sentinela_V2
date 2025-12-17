import { useState } from 'react';
import { Bug, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const testViolations = [
  {
    employee_name: 'João Silva',
    policy_name: 'Bloqueio de Print Screen',
    violation_type: 'Captura de tela bloqueada',
    severity: 'high',
    description: 'Tentativa de capturar tela durante visualização de dados confidenciais',
    device: 'Desktop-001',
  },
  {
    employee_name: 'Maria Santos',
    policy_name: 'Bloqueio de USB',
    violation_type: 'Dispositivo USB bloqueado',
    severity: 'critical',
    description: 'Tentativa de conexão de pendrive não autorizado',
    device: 'Laptop-042',
  },
  {
    employee_name: 'Carlos Oliveira',
    policy_name: 'Acesso a Sites Bloqueados',
    violation_type: 'Acesso negado',
    severity: 'medium',
    description: 'Tentativa de acesso a site de entretenimento durante horário de trabalho',
    device: 'Desktop-015',
  },
  {
    employee_name: 'Ana Costa',
    policy_name: 'Bloqueio de HD Externo',
    violation_type: 'Dispositivo de armazenamento bloqueado',
    severity: 'critical',
    description: 'Tentativa de conexão de HD externo não autorizado',
    device: 'Laptop-023',
  },
  {
    employee_name: 'Pedro Lima',
    policy_name: 'Instalação de Software',
    violation_type: 'Instalação bloqueada',
    severity: 'low',
    description: 'Tentativa de instalar software não autorizado',
    device: 'Desktop-008',
  },
];

export function SimulateViolationButton() {
  const [loading, setLoading] = useState(false);

  const simulateViolation = async () => {
    setLoading(true);
    try {
      const randomViolation = testViolations[Math.floor(Math.random() * testViolations.length)];
      const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      
      const { error } = await supabase
        .from('security_violations')
        .insert({
          ...randomViolation,
          ip_address: ip,
        });

      if (error) throw error;
      
      toast.success('Violação simulada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao simular violação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={simulateViolation}
      disabled={loading}
      className="gap-2 border-warning/50 text-warning hover:bg-warning/10"
    >
      <Zap className="h-4 w-4" />
      {loading ? 'Simulando...' : 'Simular Violação'}
    </Button>
  );
}
