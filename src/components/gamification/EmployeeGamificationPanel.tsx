import { useState } from "react";
import { Award, Loader2, ShieldOff, Trash2, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployeeGamification, type PeriodoPontos } from "@/hooks/useEmployeeGamification";
import { useAuth } from "@/hooks/useAuth";

const PERIODOS: { valor: PeriodoPontos; rotulo: string }[] = [
  { valor: "7", rotulo: "7 dias" },
  { valor: "30", rotulo: "30 dias" },
  { valor: "all", rotulo: "Tudo" },
];

function formatarData(valor: string) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "-" : data.toLocaleString("pt-BR");
}

/**
 * Gamificação por funcionário: histórico de pontos (`points_history`) e
 * conquistas (`employee_badges`). As tres tabelas tem escrita restrita a admin
 * por RLS, por isso as acoes so aparecem para `user.isAdmin`.
 */
export function EmployeeGamificationPanel() {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.isAdmin);
  const {
    funcionarios,
    employeeId,
    setEmployeeId,
    periodo,
    setPeriodo,
    historico,
    totalPontos,
    conquistas,
    catalogo,
    isLoading,
    isLoadingFuncionarios,
    isSaving,
    handleConceder,
    handleRemover,
  } = useEmployeeGamification();
  const [badgeSelecionado, setBadgeSelecionado] = useState("");

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
          <ShieldOff className="h-8 w-8 opacity-60" />
          <p className="text-foreground font-medium">Acesso restrito</p>
          <p className="text-sm">
            O histórico de pontos e as conquistas de cada funcionário ficam visíveis apenas para
            administradores.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base">Por funcionário</CardTitle>
          <CardDescription>
            Histórico de pontos e conquistas recebidas, com a opção de conceder ou retirar uma
            conquista.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger className="h-9 w-[220px]" aria-label="Selecionar funcionário">
              <SelectValue placeholder="Selecione o funcionário" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingFuncionarios ? (
                <SelectItem value="__carregando" disabled>
                  Carregando...
                </SelectItem>
              ) : funcionarios.length === 0 ? (
                <SelectItem value="__vazio" disabled>
                  Nenhum funcionário ativo
                </SelectItem>
              ) : (
                funcionarios.map((funcionario) => (
                  <SelectItem key={funcionario.id} value={funcionario.id}>
                    {funcionario.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 rounded-md border p-0.5">
            {PERIODOS.map((opcao) => (
              <Button
                key={opcao.valor}
                size="sm"
                variant={periodo === opcao.valor ? "secondary" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setPeriodo(opcao.valor)}
                aria-pressed={periodo === opcao.valor}
              >
                {opcao.rotulo}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!employeeId ? (
          <div className="py-10 text-center">
            <UserRound className="text-muted-foreground mx-auto mb-3 h-8 w-8 opacity-50" />
            <p className="font-medium">Selecione um funcionário</p>
            <p className="text-muted-foreground text-sm">
              O histórico de pontos e as conquistas aparecem aqui.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-10" role="status" aria-live="polite">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            <span className="sr-only">Carregando dados do funcionário...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold">{totalPontos}</p>
                <p className="text-muted-foreground text-xs">Pontos no período</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold">{conquistas.length}</p>
                <p className="text-muted-foreground text-xs">Conquistas</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold">Histórico de pontos</h3>
                {historico.length === 0 ? (
                  <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                    Nenhum ponto registrado nesse período.
                  </p>
                ) : (
                  <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {historico.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-lg border p-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {item.description || item.action_type}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {item.action_type} - {formatarData(item.created_at)}
                          </p>
                        </div>
                        <Badge variant={item.points >= 0 ? "default" : "destructive"}>
                          {item.points > 0 ? "+" : ""}
                          {item.points}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Conquistas recebidas</h3>
                {conquistas.length === 0 ? (
                  <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                    Nenhuma conquista atribuída ainda.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {conquistas.map((conquista) => (
                      <li
                        key={conquista.id}
                        className="flex items-center justify-between gap-2 rounded-lg border p-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{conquista.badge?.icon || "🏅"}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {conquista.badge?.name ?? "Conquista removida"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatarData(conquista.earned_at)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive h-8"
                          disabled={isSaving}
                          onClick={() => handleRemover(conquista.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">
                            Remover conquista {conquista.badge?.name ?? ""}
                          </span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-2.5">
                  <Select value={badgeSelecionado} onValueChange={setBadgeSelecionado}>
                    <SelectTrigger className="h-9 flex-1" aria-label="Conquista a conceder">
                      <SelectValue placeholder="Conceder conquista..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogo.length === 0 ? (
                        <SelectItem value="__vazio" disabled>
                          Todas as conquistas ativas já foram atribuídas
                        </SelectItem>
                      ) : (
                        catalogo.map((badge) => (
                          <SelectItem key={badge.id} value={badge.id}>
                            {badge.icon ? badge.icon + " " : ""}
                            {badge.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    className="h-9 gap-2"
                    disabled={!badgeSelecionado || badgeSelecionado === "__vazio" || isSaving}
                    onClick={() => {
                      handleConceder(badgeSelecionado);
                      setBadgeSelecionado("");
                    }}
                  >
                    <Award className="h-4 w-4" />
                    Conceder
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default EmployeeGamificationPanel;
