import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionMatrix, RoleManager, RolePermissionsEditor } from '@/components/permissions';
import { Shield, Users, Edit } from 'lucide-react';

export default function Permissions() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Permissões Granulares</h1>
            <p className="text-muted-foreground">
              Gerencie roles e configure permissões detalhadas para cada módulo
            </p>
          </div>
        </div>

        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList>
            <TabsTrigger value="editor" className="gap-2">
              <Edit className="h-4 w-4" />
              Editar por Role
            </TabsTrigger>
            <TabsTrigger value="matrix" className="gap-2">
              <Shield className="h-4 w-4" />
              Matriz Completa
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Users className="h-4 w-4" />
              Gerenciar Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            <RolePermissionsEditor />
          </TabsContent>

          <TabsContent value="matrix">
            <PermissionMatrix />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
