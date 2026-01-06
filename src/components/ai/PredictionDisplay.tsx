import * as React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Brain, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export interface Prediction { id: string; type: string; value: number | string; confidence: number; trend?: 'up' | 'down' | 'stable'; description: string; impact?: 'low' | 'medium' | 'high'; timeframe?: string; }

const trendIcons = { up: TrendingUp, down: TrendingDown, stable: Minus };
const impactColors = { low: 'bg-blue-100 text-blue-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800' };

export function PredictionCard({ prediction, className }: { prediction: Prediction; className?: string }) {
  const TrendIcon = prediction.trend ? trendIcons[prediction.trend] : null;
  const trendColor = prediction.trend === 'up' ? 'text-green-600' : prediction.trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />{prediction.type}</CardTitle>
          {prediction.impact && <Badge className={impactColors[prediction.impact]}>{prediction.impact}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-3xl font-bold">{prediction.value}</span>
          {TrendIcon && <TrendIcon className={cn('h-5 w-5', trendColor)} />}
        </div>
        <p className="text-sm text-muted-foreground mb-3">{prediction.description}</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Confidence</span>
            <span>{(prediction.confidence * 100).toFixed(0)}%</span>
          </div>
          <Progress value={prediction.confidence * 100} className="h-1.5" />
        </div>
        {prediction.timeframe && <p className="text-xs text-muted-foreground mt-2">Timeframe: {prediction.timeframe}</p>}
      </CardContent>
    </Card>
  );
}

export function PredictionList({ predictions, className }: { predictions: Prediction[]; className?: string }) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {predictions.map(p => <PredictionCard key={p.id} prediction={p} />)}
    </div>
  );
}
export default PredictionCard;
