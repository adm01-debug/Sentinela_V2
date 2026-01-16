import { Wrench, Clock, Bell } from 'lucide-react';
import { Button  } from '@/components/ui/button';
import { Input  } from '@/components/ui/input';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <Wrench className="h-24 w-24 text-primary mx-auto animate-pulse" />
        <h1 className="text-3xl font-bold mt-6">Em Manutenção</h1>
        <p className="text-muted-foreground mt-4">Estamos realizando melhorias no sistema. Voltaremos em breve!</p>
        <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground"><Clock className="h-5 w-5" /><span>Previsão: 30 minutos</span></div>
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <p className="font-medium flex items-center justify-center gap-2"><Bell className="h-4 w-4" />Receba uma notificação quando voltarmos</p>
          <div className="flex gap-2 mt-4"><Input placeholder="seu@email.com" type="email" /><Button>Notificar</Button></div>
        </div>
      </div>
    </div>
  );
}