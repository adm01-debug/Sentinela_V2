import { Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Employee {
  employee: string;
  productivity: number;
}

const rankColors = [
  "bg-warning/10 text-warning border-warning/30",
  "bg-muted text-muted-foreground border-border",
  "bg-muted text-muted-foreground border-border",
];

export const TopEmployeesList = ({ employees }: { employees: Employee[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <Trophy className="h-4 w-4 text-warning" />
        Melhores Desempenhos
      </CardTitle>
    </CardHeader>
    <CardContent>
      {employees.length > 0 ? (
        <div className="space-y-3">
          {employees.map((emp, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold",
                    i < 3 ? rankColors[i] : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {i + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {emp.employee
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-card-foreground">{emp.employee}</span>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  emp.productivity >= 80
                    ? "text-success"
                    : emp.productivity >= 50
                      ? "text-warning"
                      : "text-destructive"
                )}
              >
                {emp.productivity}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Users className="mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">Sem dados ainda</p>
          <p className="text-xs">O ranking será exibido quando houver atividade</p>
        </div>
      )}
    </CardContent>
  </Card>
);
