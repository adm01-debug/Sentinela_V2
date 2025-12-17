import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { activityData } from '@/data/mockData';

export function ActivityChart() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">Atividade por Hora</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="productive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="neutral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="unproductive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 15%)" />
            <XAxis dataKey="hour" stroke="hsl(215, 20%, 55%)" fontSize={12} />
            <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(222, 47%, 8%)', 
                border: '1px solid hsl(222, 47%, 15%)',
                borderRadius: '8px'
              }}
            />
            <Area type="monotone" dataKey="productive" stackId="1" stroke="hsl(142, 76%, 36%)" fill="url(#productive)" name="Produtivo" />
            <Area type="monotone" dataKey="neutral" stackId="1" stroke="hsl(217, 91%, 60%)" fill="url(#neutral)" name="Neutro" />
            <Area type="monotone" dataKey="unproductive" stackId="1" stroke="hsl(0, 84%, 60%)" fill="url(#unproductive)" name="Improdutivo" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Produtivo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Neutro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <span className="text-sm text-muted-foreground">Improdutivo</span>
        </div>
      </div>
    </div>
  );
}
