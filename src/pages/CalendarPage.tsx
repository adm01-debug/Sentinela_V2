import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, getDay, isToday, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLayout } from "@/components/layout/PageLayout";
import { useCalendar } from "@/hooks/useCalendar";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  actual_start: string | null;
  actual_end: string | null;
  total_worked_minutes: number;
  late_minutes: number;
  employees: { name: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  present: "bg-green-500/10 text-green-700 border-green-500/20",
  absent: "bg-red-500/10 text-red-700 border-red-500/20",
  late: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  partial: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  holiday: "bg-blue-500/10 text-blue-700 border-blue-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  present: "Presente",
  absent: "Ausente",
  late: "Atrasado",
  partial: "Parcial",
  holiday: "Feriado",
};

export default function CalendarPage() {
  const { currentDate, days, nextMonth, prevMonth, goToDate } = useCalendar();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDay = getDay(monthStart);

  const { data: records = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendance-calendar", format(monthStart, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_records")
        .select(
          "id, date, status, actual_start, actual_end, total_worked_minutes, late_minutes, employees(name)"
        )
        .gte("date", format(monthStart, "yyyy-MM-dd"))
        .lte("date", format(monthEnd, "yyyy-MM-dd"))
        .order("date");
      if (error) throw error;
      return (data ?? []) as AttendanceRecord[];
    },
  });

  const recordsByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    for (const r of records) {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    }
    return map;
  }, [records]);

  const monthStats = useMemo(
    () => ({
      present: records.filter((r) => r.status === "present").length,
      absent: records.filter((r) => r.status === "absent").length,
      late: records.filter((r) => r.status === "late").length,
      total: records.length,
    }),
    [records]
  );

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todayRecords = recordsByDate[todayKey] ?? [];

  return (
    <PageLayout>
      <PageHeader
        title="Calendário"
        description="Presença e eventos do mês"
        showBackButton={false}
      />

      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            icon: UserCheck,
            label: "Presenças",
            value: monthStats.present,
            color: "text-green-600",
          },
          { icon: UserX, label: "Ausências", value: monthStats.absent, color: "text-red-600" },
          { icon: Clock, label: "Atrasos", value: monthStats.late, color: "text-yellow-600" },
          {
            icon: CalendarIcon,
            label: "Registros",
            value: monthStats.total,
            color: "text-primary",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className={`h-7 w-7 ${color}`} />
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-muted-foreground text-xs">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                onClick={() => goToDate(new Date())}
              >
                Hoje
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-2 grid grid-cols-7 gap-1">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div key={d} className="text-muted-foreground py-1 text-center text-xs font-medium">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {isLoading
              ? days.map((day) => <Skeleton key={day.toISOString()} className="h-16 rounded-lg" />)
              : days.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const dayRecords = recordsByDate[dateKey] ?? [];
                  const counts: Record<string, number> = {};
                  for (const r of dayRecords) counts[r.status] = (counts[r.status] || 0) + 1;
                  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
                  return (
                    <div
                      key={dateKey}
                      className={`hover:bg-accent/50 min-h-[60px] rounded-lg border p-1.5 text-xs transition-colors ${
                        isToday(day)
                          ? "border-primary ring-primary/40 ring-1"
                          : "border-transparent"
                      } ${dominant ? (STATUS_COLORS[dominant] ?? "") : ""}`}
                    >
                      <span
                        className={`mb-0.5 block text-right font-medium ${isToday(day) ? "text-primary" : ""}`}
                      >
                        {format(day, "d")}
                      </span>
                      {dominant && (
                        <span className="block text-center text-[10px] leading-tight">
                          {STATUS_LABELS[dominant] ?? dominant}
                          {dayRecords.length > 1 && ` ×${dayRecords.length}`}
                        </span>
                      )}
                    </div>
                  );
                })}
          </div>
        </CardContent>
      </Card>

      {todayRecords.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Hoje — {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {todayRecords.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <span className="truncate font-medium">{r.employees?.name ?? "—"}</span>
                <div className="flex shrink-0 items-center gap-2">
                  {r.actual_start && (
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(r.actual_start), "HH:mm")}
                      {r.actual_end ? ` – ${format(new Date(r.actual_end), "HH:mm")}` : ""}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${STATUS_COLORS[r.status] ?? ""}`}
                  >
                    {STATUS_LABELS[r.status] ?? r.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export { CalendarPage };
