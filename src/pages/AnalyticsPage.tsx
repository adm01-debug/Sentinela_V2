import { useState } from "react";
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseAreaChart } from "@/components/charts";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7d");
  const { data } = useAnalytics({ period });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          showBackButton={false}
          actions={
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">Produtividade</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{data?.productivity || 0}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="text-info h-4 w-4" />
                <span className="text-sm text-muted-foreground">Horas Ativas</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{data?.activeHours || 0}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent-foreground" />
                <span className="text-sm text-muted-foreground">Usuários Ativos</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{data?.activeUsers || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-warning" />
                <span className="text-sm text-muted-foreground">Apps Usados</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{data?.appsUsed || 0}</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Produtividade ao longo do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <BaseAreaChart
                data={data?.chartData || []}
                series={[{ dataKey: "productivity", label: "Produtividade" }]}
                xAxisKey="date"
                height={320}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
