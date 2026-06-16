import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAlerts, useAcknowledgeAlert, useAcknowledgeAllAlerts } from "@/hooks";
import { AlertList } from "@/components/AlertList";
import { AlertFilters } from "@/components/AlertFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useChartColors } from "@/hooks/useChartColors";

export const AlertsPage = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<{ severity?: string; acknowledged?: boolean }>({});
  const { data: alerts, isLoading } = useAlerts(filters);
  const acknowledgeAlert = useAcknowledgeAlert();
  const acknowledgeAll = useAcknowledgeAllAlerts();
  const colors = useChartColors();

  const alertsList = useMemo(() => alerts?.data || [], [alerts]);
  const unacknowledgedCount =
    alertsList.filter((a: { acknowledged?: boolean }) => !a.acknowledged).length || 0;

  // Severity distribution
  const severityData = useMemo(() => {
    const map: Record<string, number> = {};
    alertsList.forEach((a: { severity?: string }) => {
      const s = a.severity || "unknown";
      map[s] = (map[s] || 0) + 1;
    });
    const severityColors: Record<string, string> = {
      critical: colors.destructive,
      high: colors.warning,
      medium: colors.info,
      low: colors.muted,
    };
    return Object.entries(map).map(([name, value]) => ({
      name:
        name === "critical"
          ? "Crítico"
          : name === "high"
            ? "Alto"
            : name === "medium"
              ? "Médio"
              : name === "low"
                ? "Baixo"
                : name,
      value,
      color: severityColors[name] || colors.accent,
    }));
  }, [alertsList, colors]);

  // Acknowledged vs pending
  const statusData = useMemo(() => {
    const acked = alertsList.filter((a: { acknowledged?: boolean }) => a.acknowledged).length;
    const pending = alertsList.length - acked;
    return [
      { name: "Pendentes", value: pending, color: colors.warning },
      { name: "Reconhecidos", value: acked, color: colors.success },
    ].filter((d) => d.value > 0);
  }, [alertsList, colors]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.alerts")}
        description="Visualize e gerencie todos os alertas de segurança e violações de política."
        showBackButton={false}
        actions={
          unacknowledgedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => acknowledgeAll.mutate()}
              className="h-9"
            >
              Reconhecer Todos ({unacknowledgedCount})
            </Button>
          )
        }
      />

      {/* Charts */}
      {alertsList.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Alertas por Severidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={severityData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: colors.muted, fontSize: 11 }}
                      stroke={colors.border}
                    />
                    <YAxis
                      tick={{ fill: colors.muted, fontSize: 11 }}
                      stroke={colors.border}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" name="Alertas" radius={[4, 4, 0, 0]}>
                      {severityData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status dos Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-center gap-4">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertFilters filters={filters} onChange={setFilters} />
      <AlertList
        alerts={alertsList}
        isLoading={isLoading}
        onAcknowledge={(id) => acknowledgeAlert.mutate(id)}
      />
    </div>
  );
};

export default AlertsPage;
