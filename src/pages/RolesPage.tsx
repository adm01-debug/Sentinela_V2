import { Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoles } from "@/hooks/useRoles";

export default function RolesPage() {
  const { roles, isLoading } = useRoles();

  if (isLoading)
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );

  const displayRoles =
    roles.length > 0
      ? roles
      : [
          {
            id: "1",
            name: "Admin",
            description: "Acesso total ao sistema",
            permissions: ["*"],
            userCount: 0,
            is_active: true,
            created_at: "",
          },
          {
            id: "2",
            name: "Manager",
            description: "Gerencia funcionários e relatórios",
            permissions: ["read", "write"],
            userCount: 0,
            is_active: true,
            created_at: "",
          },
          {
            id: "3",
            name: "Analyst",
            description: "Acesso a relatórios e analytics",
            permissions: ["read"],
            userCount: 0,
            is_active: true,
            created_at: "",
          },
          {
            id: "4",
            name: "Viewer",
            description: "Visualização limitada",
            permissions: ["read"],
            userCount: 0,
            is_active: true,
            created_at: "",
          },
        ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Shield className="h-6 w-6 text-primary" />
            Funções e Permissões
          </h1>
          <p className="mt-1 text-muted-foreground">Configure funções e permissões de acesso</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {displayRoles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  {role.name}
                </CardTitle>
                <Badge variant="outline">
                  <Users className="mr-1 h-3 w-3" />
                  {role.userCount} usuários
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">{role.description}</p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs">
                    {p === "*" ? "Acesso Total" : p}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { RolesPage };
