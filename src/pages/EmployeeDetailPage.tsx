import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEmployee, useEmployeeStats, type EmployeeWithDetails } from '@/hooks/useEmployees';
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { DailyJourneyTimeline } from '@/components/timeline/DailyJourneyTimeline';
import { ScreenshotViewerDialog } from '@/components/timeline/ScreenshotViewerDialog';
import { TeamComparisonCard } from '@/components/timeline/TeamComparisonCard';
import { useDailyJourney } from '@/hooks/useDailyJourney';
import { useTeamProductivityAverage } from '@/hooks/useTeamProductivityAverage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/Skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { format, subDays, addDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import { generateJourneyPdf } from '@/utils/journeyPdf';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: employeeRaw, isLoading } = useEmployee(id!);
  const employee = employeeRaw as EmployeeWithDetails | undefined;
  const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const { data: stats } = useEmployeeStats(id!, startDate, endDate);

  const [journeyDate, setJourneyDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [screenshotId, setScreenshotId] = useState<string | null>(null);
  const shiftDay = (delta: number) =>
    setJourneyDate((d) => format(addDays(parseISO(d), delta), 'yyyy-MM-dd'));

  const { data: journey, isLoading: journeyLoading } = useDailyJourney(id!, journeyDate);
  const journeyEvents = journey?.events ?? [];
  const journeySummary = journey?.summary;

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!employee) return <div className="p-6">Funcionário não encontrado</div>;

  const displayName = employee.full_name ?? employee.name ?? 'Sem nome';

  return (
    <div className="space-y-6">
      <PageHeader
        title={displayName}
        description={`Detalhes e histórico de atividades de ${displayName}.`}
      />

      <EmployeeHeader employee={employee} />

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[540px]">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="journey">Jornada</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-6">
          <ActivityTimeline employeeId={id!} />
        </TabsContent>
        <TabsContent value="journey" className="mt-6 space-y-4">
          <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => shiftDay(-1)} aria-label="Dia anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="grid gap-1">
                <Label htmlFor="journey-date" className="text-xs text-muted-foreground">Data</Label>
                <Input
                  id="journey-date"
                  type="date"
                  value={journeyDate}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shiftDay(1)}
                aria-label="Próximo dia"
                disabled={journeyDate >= format(new Date(), 'yyyy-MM-dd')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setJourneyDate(format(new Date(), 'yyyy-MM-dd'))}>
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateJourneyPdf({ employeeName: displayName, date: journeyDate, events: journeyEvents, summary: journeySummary })}
              disabled={journeyLoading}
            >
              <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              {journeyLoading ? 'Carregando…' : `${journeyEvents.length} eventos`}
            </div>
          </div>
          {journeySummary && journeySummary.totalSeconds > 0 && (
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Score de produtividade</div>
                <div className="text-2xl font-bold text-success">{journeySummary.productivityScore}%</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Produtivo</div>
                <div className="text-2xl font-bold">{Math.round(journeySummary.productiveSeconds / 60)} min</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Neutro</div>
                <div className="text-2xl font-bold">{Math.round(journeySummary.neutralSeconds / 60)} min</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Improdutivo</div>
                <div className="text-2xl font-bold text-destructive">{Math.round(journeySummary.unproductiveSeconds / 60)} min</div>
              </div>
            </div>
          )}
          <TeamComparisonSection
            employeeName={displayName}
            date={journeyDate}
            employeeScore={journeySummary?.productivityScore ?? 0}
          />
          <DailyJourneyTimeline
            date={journeyDate}
            events={journeyEvents}
            onScreenshotClick={(id) => setScreenshotId(id)}
          />
          <ScreenshotViewerDialog
            screenshotId={screenshotId}
            onOpenChange={(open) => !open && setScreenshotId(null)}
          />
          {journeySummary && journeySummary.topApps.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-2 text-sm font-semibold">Top aplicações do dia</div>
              <ul className="space-y-1 text-sm">
                {journeySummary.topApps.map((a) => (
                  <li key={a.name} className="flex justify-between">
                    <span className="text-foreground">{a.name}</span>
                    <span className="text-muted-foreground">{Math.round(a.seconds / 60)} min</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <div className="bg-card border rounded-lg p-12 text-center text-muted-foreground">
            {stats ? 'Estatísticas em desenvolvimento.' : 'Sem estatísticas no período.'}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
