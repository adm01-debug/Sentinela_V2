import { MessageCircle, Settings, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function WhatsAppIntegrationPage() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("channel", "whatsapp")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton className="h-96" />
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integração WhatsApp"
        description="Configure mensagens e alertas via WhatsApp"
        showBackButton={false}
        actions={
          <Button className="h-9 gap-2">
            <Settings className="h-4 w-4" />
            Configurar
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <MessageCircle className="mx-auto h-5 w-5 text-success" />
            <p className="mt-1 text-2xl font-bold">{templates?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Send className="text-info mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">
              {templates?.filter((t) => t.is_active).length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Settings className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-1 text-2xl font-bold">API</p>
            <p className="text-xs text-muted-foreground">WhatsApp Business</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Templates de Mensagem</CardTitle>
        </CardHeader>
        <CardContent>
          {(templates || []).length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum template WhatsApp configurado.
            </p>
          ) : (
            <div className="space-y-3">
              {templates?.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="max-w-md truncate text-sm text-muted-foreground">
                      {t.body.slice(0, 80)}...
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={t.is_active ? "default" : "secondary"}>
                      {t.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">{t.template_type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { WhatsAppIntegrationPage };
