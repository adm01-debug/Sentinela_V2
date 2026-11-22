// ============================================================
// ADMIN SECURITY PAGE - Painel unificado de seguranca
// ============================================================
// As queries do painel (monitoring_settings, security_violations,
// rate_limit_*, blocked_ips, whitelisted_ips, geo_*) exigem role admin
// no banco. Por isso a rota vive em /admin e e cercada por AdminGuard.

import { UnifiedSecurityPanel } from "@/components/security/UnifiedSecurityPanel";

export default function AdminSecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Seguranca</h1>
        <p className="text-muted-foreground">
          Score de seguranca, MFA, dispositivos confiaveis, sessoes, IPs bloqueados e
          geolocalizacao.
        </p>
      </div>
      <UnifiedSecurityPanel />
    </div>
  );
}
