import { useState } from "react";
import { Shield, Save, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import {
  useRolesWithPermissions,
  usePermissionsByModule,
  useBulkUpdateRolePermissions,
  type RoleWithPermissions,
} from "@/hooks/useGranularPermissions";

/**
 * Matriz de permissoes por role. Leitura para qualquer usuario com acesso a
 * rota; edicao apenas para admin (as policies de roles/role_permissions no
 * banco ja exigem admin para escrita, isto evita oferecer o que falharia).
 */
export default function RolesPage() {
  const { data: roles = [], isLoading } = useRolesWithPermissions();
  const permissionsByModule = usePermissionsByModule();
  const bulkUpdate = useBulkUpdateRolePermissions();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.isAdmin === true;

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Set<string>>(new Set());

  const activeRole: RoleWithPermissions | undefined = selectedRoleId
    ? roles.find((r) => r.id === selectedRoleId)
    : undefined;

  const startEdit = (role: RoleWithPermissions) => {
    setSelectedRoleId(role.id);
    setDraft(new Set(role.permissions.map((p) => p.id)));
  };

  const cancelEdit = () => {
    setSelectedRoleId(null);
    setDraft(new Set());
  };

  const togglePermission = (permissionId: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) next.delete(permissionId);
      else next.add(permissionId);
      return next;
    });
  };

  const save = () => {
    if (!activeRole) return;
    bulkUpdate.mutate(
      { roleId: activeRole.id, permissionIds: Array.from(draft) },
      { onSuccess: cancelEdit }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const modules = Object.keys(permissionsByModule).sort();

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Funcoes e Permissoes"
        description="Cada funcao define o que o usuario pode ver e fazer. Marque as permissoes por modulo."
      />

      {roles.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center">
            Nenhuma funcao encontrada no banco.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => {
            const editing = editingFor(role);
            return (
              <Card key={role.id} className={editing ? "ring-primary ring-2" : undefined}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-4 w-4" />
                      {role.name}
                    </CardTitle>
                    <Badge variant="outline" className="shrink-0">
                      {role.permissions.length} permissoes
                    </Badge>
                  </div>
                  <CardDescription>{role.description ?? "Sem descricao"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {role.is_system && (
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <Lock className="h-3 w-3" />
                      Funcao do sistema
                    </div>
                  )}

                  {editing ? (
                    <div className="space-y-3">
                      {modules.map((module) => (
                        <div key={module}>
                          <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                            {module}
                          </p>
                          <div className="grid grid-cols-1 gap-1">
                            {permissionsByModule[module].map((perm) => (
                              <label
                                key={perm.id}
                                className="flex cursor-pointer items-center gap-2 text-sm"
                              >
                                <Checkbox
                                  checked={draft.has(perm.id)}
                                  onCheckedChange={() => togglePermission(perm.id)}
                                />
                                <span>{perm.action}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={save} disabled={bulkUpdate.isPending}>
                          <Save className="mr-1 h-3.5 w-3.5" />
                          {bulkUpdate.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.length === 0 && (
                          <span className="text-muted-foreground text-sm">
                            Nenhuma permissao atribuida
                          </span>
                        )}
                        {role.permissions.map((p) => (
                          <Badge key={p.id} variant="secondary" className="text-xs">
                            {p.name}
                          </Badge>
                        ))}
                      </div>
                      {isAdmin && (
                        <Button size="sm" variant="outline" onClick={() => startEdit(role)}>
                          Editar permissoes
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  function editingFor(role: RoleWithPermissions) {
    return isAdmin && selectedRoleId === role.id;
  }
}

export { RolesPage };
