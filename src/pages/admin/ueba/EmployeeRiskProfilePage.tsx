import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Activity, Target } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { RiskScoreBadge } from "@/components/ueba/RiskScoreBadge";
import { useRiskScores } from "@/hooks/useRiskScores";
import { useBehavioralBaseline } from "@/hooks/useBehavioralBaseline";
import { useMitreTechniques } from "@/hooks/useMitreTechniques";
import { useChartColors } from "@/hooks/useChartColors";

export const EmployeeRiskProfilePage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const colors = useChartColors();
  const { scores, loading } = useRiskScores(employeeId, 30);
  const { baselines } = useBehavioralBaseline(employeeId);
  const { byId } = useMitreTechniques();

  const latest = scores[0];
  const timeline = [...scores].reverse().map((s) => ({
    date: format(new Date(s.calculated_at), "MM/dd HH:mm"),
    score: s.score,
  }));

  const allMitre = new Set<string>();
  scores.forEach((s) => (s.mitre_techniques || []).forEach((t) => allMitre.add(t)));

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/ueba")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Perfil de Risco</h1>
            <p className="text-sm text-muted-foreground">Análise comportamental detalhada</p>
          </div>
          {latest && (
            <RiskScoreBadge
              score={latest.score}
              level={latest.level}
              size="lg"
              className="ml-auto"
            />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4" />
              Timeline de Risk Score (últimos {scores.length} cálculos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              {loading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Carregando...</div>
              ) : timeline.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Sem histórico de scores
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: colors.muted, fontSize: 10 }}
                      stroke={colors.border}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: colors.muted, fontSize: 11 }}
                      stroke={colors.border}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <ReferenceLine y={26} stroke={colors.warning} strokeDasharray="3 3" />
                    <ReferenceLine y={51} stroke="#f97316" strokeDasharray="3 3" />
                    <ReferenceLine y={76} stroke={colors.destructive} strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={colors.primary}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Fatores Contribuintes (último cálculo)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!latest || latest.factors.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Nenhum fator anômalo detectado.
                </p>
              ) : (
                <div className="space-y-3">
                  {latest.factors.map((f) => (
                    <div key={f.name} className="border-l-2 border-warning pl-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {f.name.replace(/_/g, " ")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          z={f.z_score}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Atual: {f.current.toFixed(1)} · Baseline: {f.baseline_mean.toFixed(1)} ·
                        Peso: {f.weight}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4" />
                Técnicas MITRE ATT&CK Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allMitre.size === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Nenhuma técnica MITRE associada.
                </p>
              ) : (
                <div className="space-y-2">
                  {Array.from(allMitre).map((id) => {
                    const t = byId(id);
                    return (
                      <a
                        key={id}
                        href={t?.url || `https://attack.mitre.org/techniques/${id}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-md border border-border p-2 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-xs text-primary">{id}</span>
                            <span className="ml-2 text-sm font-medium">{t?.name || "Unknown"}</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                        {t?.tactic && (
                          <p className="mt-1 text-xs text-muted-foreground">{t.tactic}</p>
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Baselines Comportamentais ({baselines.length} features)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {baselines.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                Sem baseline ainda. Aguarde o build noturno.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {baselines.map((b) => (
                  <div key={b.id} className="rounded-md border border-border p-2 text-xs">
                    <div className="font-medium capitalize">
                      {b.feature_name.replace(/_/g, " ")}
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      μ={b.mean.toFixed(1)} σ={b.std_dev.toFixed(1)} n={b.sample_size}
                      {b.insufficient_data && (
                        <Badge variant="outline" className="ml-1 text-[10px]">
                          low data
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default EmployeeRiskProfilePage;
