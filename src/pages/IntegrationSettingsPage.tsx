import { Plug, Key, Globe, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIntegrations } from "@/hooks/useIntegrations";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS = [
  {
    name: "Chaves de API",
    desc: "Gerencie chaves de API do desktop agent",
    icon: Key,
    path: "/settings/api",
    type: "api",
  },
  {
    name: "Webhooks",
    desc: "Configure endpoints de notificação",
    icon: Globe,
    path: "/integrations/webhooks",
    type: "webhook",
  },
  {
    name: "WhatsApp",
    desc: "Alertas via WhatsApp Business",
    icon: MessageCircle,
    path: "/integrations/whatsapp",
    type: "whatsapp",
  },
  {
    name: "Integrações",
    desc: "Todas as integrações disponíveis",
    icon: Plug,
    path: "/integrations",
    type: "all",
  },
];

export default function IntegrationSettingsPage() {
  const navigate = useNavigate();
  const { integrations, isLoading } = useIntegrations();

  const getStatus = (type) => {
    if (type === "api" || type === "all") return "configured";
    const items = integrations.filter((i) => i.type === type);
    return items.some((i) => i.enabled) ? "configured" : "available";
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Plug className="h-6 w-6 text-primary" />
          Integrações
        </h1>
        <p className="mt-1 text-muted-foreground">Gerencie conexões do sistema</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ITEMS.map((item) => {
          const status = getStatus(item.type);
          return (
            <Card key={item.name} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <item.icon className="h-5 w-5 text-primary" />
                    {item.name}
                  </CardTitle>
                  {isLoading ? (
                    <Skeleton className="h-5 w-20" />
                  ) : (
                    <Badge variant={status === "configured" ? "default" : "outline"}>
                      {status === "configured" ? "Configurado" : "Disponível"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">{item.desc}</p>
                <Button variant="outline" size="sm" onClick={() => navigate(item.path)}>
                  Gerenciar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export { IntegrationSettingsPage };
