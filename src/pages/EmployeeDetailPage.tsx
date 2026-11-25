import { useState } from "react";
import { useParams } from "react-router-dom";
import { format, subDays, addDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { useEmployee, useEmployeeStats, type EmployeeWithDetails } from "@/hooks/useEmployees";
import { EmployeeHeader } from "@/components/EmployeeHeader";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { DailyJourneyTimeline } from "@/components/timeline/DailyJourneyTimeline";
import { ScreenshotViewerDialog } from "@/components/timeline/ScreenshotViewerDialog";
import { ViolationDetailDialog } from "@/components/violations/ViolationDetailDialog";
import { TeamComparisonCard } from "@/components/timeline/TeamComparisonCard";
import { EntityVersionsPanel } from "@/components/versions/EntityVersionsPanel";
import { useDailyJourney } from "@/hooks/useDailyJourney";
import { useTeamProductivityAverage } from "@/hooks/useTeamProductivityAverage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { generateJourneyPdf } from "@/utils/journeyPdf";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: employeeRaw, isLoading } = useEmployee(id!);
  const employee = employeeRaw as EmployeeWithDetails | undefined;
  const startDate = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const endDate = format(new Date(), "yyyy-MM-dd");
  const { data: stats } = useEmployeeStats(id!, startDate, endDate);

  const [journeyDate, setJourneyDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [screenshotId, setScreenshotId] = useState<string | null>(null);
  const [violationId, setViolationId] = useState<string | null>(null);
  const shiftDay = (delta: number) =>
    setJourneyDate((d) => format(addDays(parseISO(d), delta), "yyyy-MM-dd"));

  const { data: journey, isLoading: journeyLoading } = useDailyJourney(id!, journeyDate);
  const journeyEvents = journey?.events ?? [];
  const journeyClicks = journey?.clicks ?? [];
  const journeySummary = journey?.summary;

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton className="h-96" />
      </div>
    );
  if (!employee) return <div className="p-6">Funcionário não encontrado</div>;

  const displayName = employee.full_name ?? employee.name ?? "Sem nome";

  return (
    <div className="space-y-6">
      <PageHeader
        title={displayName}
        description={`Detalhes e histórico de atividades de ${displayName}.`}
      />

      <EmployeeHeader employee={employee} />

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full max-w-[720px] grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="journey">Jornada</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="versions">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-6">
          <ActivityTimeline employeeId={id!} />
        </TabsContent>
        <TabsContent value="journey" className="mt-6 space-y-4">
          <div className="bg-card flex flex-wrap items-end gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => shiftDay(-1)}
                aria-label="Dia anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="grid gap-1">
                <Label htmlFor="journey-date" className="text-muted-foreground text-xs">
                  Data
                </Label>
                <Input
                  id="journey-date"
                  type="date"
                  value={journeyDate}
                  max={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shiftDay(1)}
                aria-label="Próximo dia"
                disabled={journeyDate >= format(new Date(), "yyyy-MM-dd")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setJourneyDate(format(new Date(), "yyyy-MM-dd"))}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                generateJourneyPdf({
                  employeeName: displayName,
                  date: journeyDate,
                  events: journeyEvents,
                  summary: journeySummary,
                })
              }
              disabled={journeyLoading}
            >
              <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
            </Button>
            <div className="text-muted-foreground ml-auto text-sm">
              {journeyLoading ? "Carregando…" : `${journeyEvents.length} eventos`}
            </div>
          </div>
          {journeySummary && journeySummary.totalSeconds > 0 && (
            <div className="grid gap-3 md:grid-cols-4">
              <div className="bg-card rounded-lg border p-4">
                <div className="text-muted-foreground text-xs">Score de produtividade</div>
                <div className="text-success text-2xl font-bold">
                  {journeySummary.productivityScore}%
                </div>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <div className="text-muted-foreground text-xs">Produtivo</div>
                <div className="text-2xl font-bold">
                  {Math.round(journeySummary.productiveSeconds / 60)} min
                </div>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <div className="text-muted-foreground text-xs">Neutro</div>
                <div className="text-2xl font-bold">
                  {Math.round(journeySummary.neutralSeconds / 60)} min
                </div>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <div className="text-muted-foreground text-xs">Improdutivo</div>
                <div className="text-destructive text-2xl font-bold">
                  {Math.round(journeySummary.unproductiveSeconds / 60)} min
                </div>
              </div>
            </div>
          )}
          <TeamComparisonInline
            employeeName={displayName}
            date={journeyDate}
            employeeScore={journeySummary?.productivityScore ?? 0}
          />
          <DailyJourneyTimeline
            date={journeyDate}
            events={journeyEvents}
            onScreenshotClick={(id) => setScreenshotId(id)}
            onViolationClick={(id) => setViolationId(id)}
          />
          {journeyClicks.length > 0 && (
            <div className="bg-card rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                <span>Cliques registrados no dia</span>
                <span className="text-muted-foreground font-normal">
                  {journeyClicks.length} clique(s)
                </span>
              </div>
              <ul className="max-h-72 space-y-1 overflow-y-auto text-sm">
                {journeyClicks.map((c) => (
                  <li key={c.id} className="flex items-baseline justify-between gap-3">
                    <span className="text-foreground">
                      <span className="text-muted-foreground font-mono text-xs">
                        {new Date(c.recordedAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>{" "}
                      {c.clickType} em {c.targetElement ?? c.windowTitle ?? c.appName ?? "tela"}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {c.appName ?? c.windowTitle ?? ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ScreenshotViewerDialog
            screenshotId={screenshotId}
            onOpenChange={(open) => !open && setScreenshotId(null)}
          />
          <ViolationDetailDialog
            violationId={violationId}
            open={!!violationId}
            onOpenChange={(open) => !open && setViolationId(null)}
          />
          {journeySummary && journeySummary.topApps.length > 0 && (
            <div className="bg-card rounded-lg border p-4">
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
          <div className="bg-card text-muted-foreground rounded-lg border p-12 text-center">
            {stats ? "Estatísticas em desenvolvimento." : "Sem estatísticas no período."}
          </div>
        </TabsContent>
        <TabsContent value="versions" className="mt-6">
          <EntityVersionsPanel entityType="employees" entityId={id!} entityLabel="funcionário" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TeamComparisonInline({
  employeeName,
  date,
  employeeScore,
}: {
  employeeName: string;
  date: string;
  employeeScore: number;
}) {
  const { data, isLoading } = useTeamProductivityAverage(date, employeeName);
  return (
    <TeamComparisonCard
      employeeScore={employeeScore}
      teamAverageScore={data?.avgProductivityScore ?? 0}
      sampleSize={data?.sampleSize ?? 0}
      isLoading={isLoading}
    />
  );
}
