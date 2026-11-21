import { useState } from "react";
import { MessageCircle, Send, RefreshCw, Settings2, History } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useWhatsAppIntegrationPage } from "@/hooks/useWhatsAppIntegrationPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_LABEL: Record<string, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
};

export default function WhatsAppIntegrationPage() {
  const {
    activeTab,
    setActiveTab,
    configData,
    setConfigData,
    testNumber,
    setTestNumber,
    testMessage,
    setTestMessage,
    selectedTemplate,
    setSelectedTemplate,
    messageFilter,
    setMessageFilter,
    config,
    messages,
    templates,
    stats,
    isLoadingConfig,
    isLoadingMessages,
    isLoadingTemplates,
    isSavingConfig,
    isSendingTest,
    isSyncingTemplates,
    handleSaveConfig,
    handleSendTest,
    handleSyncTemplates,
  } = useWhatsAppIntegrationPage();

  const [showSecret, setShowSecret] = useState(false);

  if (isLoadingConfig) {
    return (
      <div className="p-6">
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integração WhatsApp"
        description="Configure credenciais, envie mensagens e sincronize templates do WhatsApp Business"
        showBackButton={false}
        actions={
          <Button
            className="h-9 gap-2"
            onClick={handleSyncTemplates}
            disabled={isSyncingTemplates}
            variant={isSyncingTemplates ? "secondary" : "default"}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncingTemplates ? "animate-spin" : ""}`} />
            {isSyncingTemplates ? "Sincronizando&hellip;" : "Sincronizar templates"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <MessageCircle className="text-success mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.totalMessages}</p>
            <p className="text-muted-foreground text-xs">Mensagens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Send className="text-info mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.sent}</p>
            <p className="text-muted-foreground text-xs">Enviadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Settings2 className="text-muted-foreground mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.templates}</p>
            <p className="text-muted-foreground text-xs">Templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <History className="text-muted-foreground mx-auto h-5 w-5" />
            <p className="mt-1 text-2xl font-bold">{stats.failed}</p>
            <p className="text-muted-foreground text-xs">Falhas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Business</CardTitle>
          {config?.is_active ? (
            <Badge className="w-fit">Ativo</Badge>
          ) : (
            <Badge variant="secondary" className="w-fit">
              Inativo
            </Badge>
          )}
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="send">Enviar teste</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider">Provedor de envio</Label>
              <Select
                value={configData.provider}
                onValueChange={(v) =>
                  setConfigData({ ...configData, provider: v as "meta" | "evolution" })
                }
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Selecione o provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meta">Meta WhatsApp Business (Graph API)</SelectItem>
                  <SelectItem value="evolution">Evolution API (via Zapp)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {configData.provider === "evolution"
                  ? "Envia via Evolution GO (instância do Zapp)"
                  : "Envia via Graph API do WhatsApp Business"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number_id">Phone Number ID</Label>
              <Input
                id="phone_number_id"
                value={configData.phone_number_id}
                onChange={(e) => setConfigData({ ...configData, phone_number_id: e.target.value })}
                placeholder="Ex.: 123456789012345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_account_id">Business Account ID</Label>
              <Input
                id="business_account_id"
                value={configData.business_account_id}
                onChange={(e) =>
                  setConfigData({ ...configData, business_account_id: e.target.value })
                }
                placeholder="Ex.: 9876543210"
              />
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="access_token">Access Token</Label>
              <div className="flex gap-2">
                <Input
                  id="access_token"
                  type={showSecret ? "text" : "password"}
                  value={configData.access_token}
                  onChange={(e) => setConfigData({ ...configData, access_token: e.target.value })}
                  placeholder="Token de acesso permanente da Meta"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 shrink-0"
                  onClick={() => setShowSecret((v) => !v)}
                >
                  {showSecret ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="webhook_verify_token">Webhook Verify Token</Label>
              <Input
                id="webhook_verify_token"
                value={configData.webhook_verify_token}
                onChange={(e) =>
                  setConfigData({ ...configData, webhook_verify_token: e.target.value })
                }
                placeholder="Token de verificação do webhook"
              />
            </div>
            {configData.provider === "evolution" && (
              <>
                <div className="col-span-full space-y-2">
                  <Label htmlFor="evolution_api_url">Evolution API URL</Label>
                  <Input
                    id="evolution_api_url"
                    value={configData.evolution_api_url}
                    onChange={(e) =>
                      setConfigData({ ...configData, evolution_api_url: e.target.value })
                    }
                    placeholder="Ex.: https://evolution-go-rxj2.srv1481814.hstgr.cloud"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <Label htmlFor="evolution_instance_token">Token da instância (apikey)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="evolution_instance_token"
                      type={showSecret ? "text" : "password"}
                      value={configData.evolution_instance_token}
                      onChange={(e) =>
                        setConfigData({
                          ...configData,
                          evolution_instance_token: e.target.value,
                        })
                      }
                      placeholder="Token da instância PRINCIPAL"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 shrink-0"
                      onClick={() => setShowSecret((v) => !v)}
                    >
                      {showSecret ? "Ocultar" : "Mostrar"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evolution_instance_name">Instância</Label>
                  <Input
                    id="evolution_instance_name"
                    value={configData.evolution_instance_name}
                    onChange={(e) =>
                      setConfigData({ ...configData, evolution_instance_name: e.target.value })
                    }
                    placeholder="PRINCIPAL"
                  />
                </div>
              </>
            )}
            <div className="col-span-full flex items-center gap-2">
              <Switch
                id="is_active"
                checked={configData.is_active}
                onCheckedChange={(v) => setConfigData({ ...configData, is_active: v })}
              />
              <Label htmlFor="is_active">Integração ativa</Label>
            </div>
          </div>
          <Button onClick={handleSaveConfig} disabled={isSavingConfig}>
            {isSavingConfig ? "Salvando&hellip;" : "Salvar configuração"}
          </Button>
        </TabsContent>

        <TabsContent value="send" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="test_number">Número de destino</Label>
            <Input
              id="test_number"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              placeholder="Ex.: 5511999999999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test_message">Mensagem</Label>
            <Input
              id="test_message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Texto livre da mensagem de teste"
            />
          </div>
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template_select">Template (opcional)</Label>
              <select
                id="template_select"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">Nenhum</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({STATUS_LABEL[t.status] || t.status})
                  </option>
                ))}
              </select>
            </div>
          )}
          <Button onClick={handleSendTest} disabled={isSendingTest}>
            {isSendingTest ? "Enviando&hellip;" : "Enviar mensagem de teste"}
          </Button>
        </TabsContent>

        <TabsContent value="templates" className="pt-4">
          {isLoadingTemplates ? (
            <Skeleton className="h-40" />
          ) : templates.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Nenhum template sincronizado. Clique em &quot;Sincronizar templates&quot; para buscar
              na Meta.
            </p>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-muted-foreground max-w-md truncate text-sm">
                      {t.body || t.category || "Sem conteúdo"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{STATUS_LABEL[t.status] || t.status}</Badge>
                    <Badge variant="outline">{t.language}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="pt-4">
          <div className="mb-4 flex gap-2">
            {["all", "sent", "delivered", "failed"].map((s) => (
              <Button
                key={s}
                variant={messageFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setMessageFilter(s)}
              >
                {s === "all" ? "Todas" : s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
          {isLoadingMessages ? (
            <Skeleton className="h-40" />
          ) : messages.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Nenhuma mensagem registrada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="flex items-start justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{m.to}</p>
                    <p className="text-muted-foreground max-w-md truncate text-sm">{m.content}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(m.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <Badge variant={m.status === "failed" ? "destructive" : "default"}>
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { WhatsAppIntegrationPage };
