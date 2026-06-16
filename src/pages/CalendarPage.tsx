import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  return (
    <PageTransition>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Calendário
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[160px] text-center font-medium capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 grid grid-cols-7 gap-1">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div key={d} className="py-2 text-center text-sm font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`cursor-pointer rounded-lg p-2 text-center text-sm transition-colors hover:bg-accent ${isToday(day) ? "bg-primary font-bold text-primary-foreground" : ""}`}
                >
                  {format(day, "d")}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export { CalendarPage };
