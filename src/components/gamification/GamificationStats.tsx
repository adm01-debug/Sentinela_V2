import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Users, Target } from 'lucide-react';

interface Props { totalParticipants: number; totalPoints: number; topScore: number; avgScore: number; }

export const GamificationStats = React.memo(function GamificationStats({ totalParticipants, totalPoints, topScore, avgScore }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Participantes</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalParticipants}</div></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Pontos</CardTitle><Star className="h-4 w-4 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Maior Pontuação</CardTitle><Trophy className="h-4 w-4 text-amber-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-amber-500">{topScore.toLocaleString()}</div></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Média</CardTitle><Target className="h-4 w-4 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{avgScore.toLocaleString()}</div></CardContent></Card>
    </div>
  );
});
