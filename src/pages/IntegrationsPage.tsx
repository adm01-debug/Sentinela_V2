import { Webhook, MessageCircle, Mail, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIntegrations } from "@/hooks/useIntegrations";
import { Skeleton } from "@/components/ui/skeleton";

const INTEGRATION_ROUTES = [
  {
    name: "Webhooks",
    description: "Envie notificações para sistemas externos via HTTP",
    icon: Webhook,
    path: "/integrations/webhooks",
    type: "webhook" as const,
  },
  {
    name: "WhatsApp Business",
    description: "Alertas e notificações via WhatsApp",
    icon: MessageCircle,
    path: "/integrations/whatsapp",
    type: "whatsapp" as const,
  },
  {
    name: "Email (Resend)",
    description: "Notificações por email para alertas críticos",
    icon: Mail,
    path: "/settings/notifications",
    type: "email" as const,
  },
  {
    name: "Push Notifications",
    description: "Notificações push no navegador",
    icon: Bell,
    path: "/settings/notifications",
    type: "push" as const,
  },
];

export default function IntegrationsPage() {
  const navigate = useNavigate();
  const { integrations, activeCount, totalCount, isLoading } = useIntegrations();

  const getStatusForType = (type) => {
    const items = integrations.filter((i) => i.type === type);
    if (items.length === 0) return "available";
    return items.some((i) => i.enabled) ? "configured" : "inactive";
  };

  const getCountForType = (type) => integrations.filter((i) => i.type === type).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrações"
        description={
          isLoading ? "Carregando..." : `${activeCount} de ${totalCount} integrações ativas`
        }
        showBackButton={false}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {INTEGRATION_ROUTES.map((integration) => {
          const status = getStatusForType(integration.type);
          const count = getCountForType(integration.type);
          return (
            <Card key={integration.name} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <integration.icon className="h-5 w-5 text-primary" />
                    {integration.name}
                  </CardTitle>
                  {isLoading ? (
                    <Skeleton className="h-5 w-20" />
                  ) : (
                    <Badge
                      variant={
                        status === "configured"
                          ? "default"
                          : status === "inactive"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {status === "configured"
                        ? `Ativo (${count})`
                        : status === "inactive"
                          ? "Inativo"
                          : "Disponível"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">{integration.description}</p>
                <Button variant="outline" size="sm" onClick={() => navigate(integration.path)}>
                  Configurar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export { IntegrationsPage };
