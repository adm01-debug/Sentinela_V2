/**
 * Quem pode agir sobre uma linha de `reports`.
 *
 * A edge generate-report roda com service_role, que ignora RLS, e o corpo da
 * requisicao carrega um reportId arbitrario — sem esta checagem qualquer
 * usuario autenticado lia o tipo do relatorio de outra empresa e reescrevia o
 * status dele. A regra abaixo espelha a policy da tabela: admin gerencia todos,
 * o solicitante ve o proprio.
 */
export function canAccessReport(ctx: {
  isServiceRole: boolean;
  callerUserId: string | null;
  isAdmin: boolean;
  callerCompanyId: string | null;
  requestedBy: string | null;
  requesterCompanyId: string | null;
}): boolean {
  if (ctx.isServiceRole) return true;
  if (!ctx.callerUserId) return false;
  if (ctx.requestedBy === ctx.callerUserId) return true;
  if (!ctx.isAdmin) return false;

  // Relatorio orfao (solicitante removido) fica com o admin, como na policy.
  if (ctx.requestedBy === null) return true;

  // Admin de outra empresa nao mexe no relatorio alheio.
  return ctx.requesterCompanyId !== null && ctx.requesterCompanyId === ctx.callerCompanyId;
}
