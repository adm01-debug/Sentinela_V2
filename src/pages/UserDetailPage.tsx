// ============================================================
// DETALHE DO USUARIO - perfil, papeis reais e empresas
// ============================================================
// A lista de /admin/users linkava para /users/:id ("Gerenciar permissoes") e essa
// rota nao existia (404). Aqui o detalhe mostra de onde vem o acesso do usuario:
// `user_roles` (papeis) e `user_companies` (empresas) - as duas tabelas que o
// AuthProvider e os guards consultam.

import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Building2, CalendarDays, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUserDetail } from "@/hooks/useUsers";
import { ROUTES } from "@/constants/routes";

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("pt-BR");
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError, error } = useUserDetail(id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={user?.name ?? "Detalhe do usuario"}
        description={user?.email}
        showBackButton={false}
        actions={
          <Button variant="outline" className="gap-2" asChild>
            <Link to={ROUTES.ADMIN_USERS}>
              <ArrowLeft className="h-4 w-4" />
              Usuarios
            </Link>
          </Button>
        }
      />

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Nao foi possivel carregar o usuario</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message ?? "Tente novamente em alguns instantes."}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {user && (
        <>
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 p-6">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-muted-foreground text-sm">{user.email || "sem e-mail"}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4" />
                  Acesso e papeis
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={ROUTES.ADMIN_ROLES}>Permissoes</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.roles.length ? (
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <Badge key={role}>{role}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Sem papel em <code>user_roles</code> - o usuario nao passa nos guards de admin.
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  O papel vem de <code>user_roles</code>, a mesma tabela lida pelo AuthProvider.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4" />
                  Empresas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.companies.length ? (
                  <ul className="space-y-1 text-sm">
                    {user.companies.map((empresa) => (
                      <li key={empresa.companyId} className="flex items-center gap-2">
                        <Building2 className="text-muted-foreground h-3.5 w-3.5" />
                        {empresa.companyName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma empresa vinculada em <code>user_companies</code>.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4" />
                Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-1 text-sm">
              <p>
                Criado em <span className="text-foreground">{formatDate(user.createdAt)}</span>
              </p>
              <p>
                ID <code className="text-xs">{user.id}</code>
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
