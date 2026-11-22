// ============================================================
// ADMIN SECURITY PAGE - Painel unificado de seguranca
// ============================================================
// As queries do painel (monitoring_settings, security_violations,
// rate_limit_*, blocked_ips, whitelisted_ips, geo_*) exigem role admin
// no banco. Por isso a rota vive em /admin e e cercada por AdminGuard.

import { useState } from "react";
import { Shield, KeyRound } from "lucide-react";
import { UnifiedSecurityPanel } from "@/components/security/UnifiedSecurityPanel";
import { PasswordResetApprovalPanel } from "@/components/auth/PasswordResetApprovalPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AdminSecurityTab = "security" | "password-resets";

export default function AdminSecurityPage() {
  const [tab, setTab] = useState<AdminSecurityTab>("security");

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Seguranca</h1>
        <p className="text-muted-foreground">
          Score de seguranca, MFA, dispositivos confiaveis, sessoes, IPs bloqueados, geolocalizacao
          e aprovacao de redefinicao de senha.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AdminSecurityTab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" aria-hidden="true" />
            Seguranca
          </TabsTrigger>
          <TabsTrigger value="password-resets" className="gap-2">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Resets de senha
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <UnifiedSecurityPanel />
        </TabsContent>
        <TabsContent value="password-resets">
          <PasswordResetApprovalPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
