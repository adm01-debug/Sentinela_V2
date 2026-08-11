import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useChartColors } from '@/hooks/useChartColors';
import { useAppCategories, type ProductivityCategory } from '@/hooks/useAppCategories';
import { ChartTooltipContent } from '@/components/charts/ChartTooltip';

interface AppUsageInput {
  app: string;
  duration: number;
}

interface Props {
  usage: AppUsageInput[];
  height?: number;
}

const LABELS: Record<ProductivityCategory | 'uncategorized', string> = {
  productive: 'Produtivo',
  neutral: 'Neutro',
  unproductive: 'Improdutivo',
  uncategorized: 'Sem categoria',
};

export function ProductivityCategoryDonut({ usage, height = 280 }: Props) {
  const { byIdentifier } = useAppCategories();
  const c = useChartColors();

  const data = useMemo(() => {
    const totals: Record<string, number> = {
      productive: 0,
      neutral: 0,
      unproductive: 0,
      uncategorized: 0,
    };
    for (const u of usage) {
      const cat = byIdentifier.get(u.app.toLowerCase());
      if (!cat) totals.uncategorized += u.duration;
      else totals[cat.category] += u.duration;
    }
    return (['productive', 'neutral', 'unproductive', 'uncategorized'] as const)
      .filter((k) => totals[k] > 0)
      .map((k) => ({ name: LABELS[k], key: k, value: totals[k] }));
  }, [usage, byIdentifier]);

  const colors: Record<string, string> = {
    productive: c.success,
    neutral: c.info,
    unproductive: c.destructive,
    uncategorized: c.muted,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tempo por Categoria de Produtividade</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          {data.length === 0 ? (
            <p className="flex h-full items-center justify-center text-muted-foreground">
              Sem dados no período.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {data.map((d) => (
                    <Cell key={d.key} fill={colors[d.key]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
