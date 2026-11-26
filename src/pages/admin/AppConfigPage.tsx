import { AlertTriangle, Loader2, RefreshCw, Save, ShieldCheck, Wrench } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  LANGUAGES,
  MAINTENANCE_MESSAGE_MAX_LENGTH,
  MAX_SESSION_MINUTES,
  MAX_UPLOAD_MB,
  MIN_SESSION_MINUTES,
  MIN_UPLOAD_MB,
  summarizeAppConfig,
  useAppConfigPage,
} from "@/hooks/useAppConfigPage";

const LANGUAGE_LABELS: Record<string, string> = {
  "pt-BR": "Portugues (Brasil)",
  en: "Ingles",
  es: "Espanhol",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-sm">{message}</p>;
}

export default function AppConfigPage() {
  const {
    config,
    companyId,
    form,
    setForm,
    dirty,
    errors,
    showErrors,
    hasErrors,
    isLoading,
    isError,
    errorMessage,
    isSaving,
    hasRow,
    submit,
    reset,
  } = useAppConfigPage();

  const summary = config ? summarizeAppConfig(config) : null;
  const visibleErrors = showErrors ? errors : {};

  const toggleLanguage = (language: string) => {
    const next = form.supportedLanguages.includes(language)
      ? form.supportedLanguages.filter((item) => item !== language)
      : [...form.supportedLanguages, language];
    setForm({ supportedLanguages: next });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuracoes Globais"
        description="Modo de manutencao, seguranca de sessao, limites de upload, IPs permitidos, idiomas e tema desta empresa."
      />

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Onde esta configuracao e aplicada</AlertTitle>
        <AlertDescription>
          A leitura desta configuracao e restrita a administradores pelo proprio banco (RLS); a
          escrita tambem. Os valores ficam guardados por empresa (uma linha por tenant) e sao a
          fonte oficial para o modo de manutencao, o tempo de sessao, o limite de upload e o MFA
          obrigatorio. Hoje nenhuma tela do produto le estes campos automaticamente: esta tela e o
          cadastro oficial, e a aplicacao em runtime depende de ligar cada consumidor.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Falha ao carregar as configuracoes</AlertTitle>
          <AlertDescription>{errorMessage ?? "Erro desconhecido"}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Modo de manutencao</CardDescription>
                <CardTitle className="text-2xl">
                  {summary?.maintenanceActive ? "Ativo" : "Desligado"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={summary?.maintenanceActive ? "destructive" : "secondary"}>
                  {summary?.maintenanceActive ? "usuarios bloqueados" : "operacao normal"}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>MFA obrigatorio</CardDescription>
                <CardTitle className="text-2xl">
                  {summary?.mfaRequired ? "Exigido" : "Opcional"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={summary?.mfaRequired ? "default" : "secondary"}>
                  {summary?.mfaRequired ? "protecao extra" : "sem exigencia"}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Limite de upload</CardDescription>
                <CardTitle className="text-2xl">{summary?.uploadMb ?? 0} MB</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Sessao de {summary?.sessionMinutes ?? 0} min
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Escopo</CardDescription>
                <CardTitle className="text-2xl">{companyId ? "Empresa" : "Global"}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {companyId ? "uma linha para esta empresa" : "sem empresa vinculada ao seu usuario"}
              </CardContent>
            </Card>
          </div>

          {!hasRow && (
            <Alert>
              <Wrench className="h-4 w-4" />
              <AlertTitle>Nenhuma linha de configuracao existe ainda</AlertTitle>
              <AlertDescription>
                Os valores mostrados sao os padroes do sistema. Ao salvar, a primeira configuracao
                deste escopo e criada.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Manutencao e seguranca</CardTitle>
              <CardDescription>
                Bloqueio de acesso e exigencia de segundo fator para todos os usuarios deste escopo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="maintenance-mode">Modo de manutencao</Label>
                  <p className="text-muted-foreground text-sm">
                    Quando ligado, o sistema deve entrar em manutencao para os usuarios desta
                    empresa.
                  </p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={form.maintenanceMode}
                  onCheckedChange={(checked) => setForm({ maintenanceMode: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Mensagem de manutencao</Label>
                <Textarea
                  id="maintenance-message"
                  value={form.maintenanceMessage}
                  maxLength={MAINTENANCE_MESSAGE_MAX_LENGTH + 50}
                  onChange={(event) => setForm({ maintenanceMessage: event.target.value })}
                  placeholder="Ex.: Estamos atualizando o sistema. Voltamos as 22h."
                />
                <p className="text-muted-foreground text-xs">
                  {form.maintenanceMessage.length}/{MAINTENANCE_MESSAGE_MAX_LENGTH} caracteres
                </p>
                <FieldError message={visibleErrors.maintenanceMessage} />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="mfa-required">Exigir MFA</Label>
                  <p className="text-muted-foreground text-sm">
                    Obriga o uso de segundo fator de autenticacao.
                  </p>
                </div>
                <Switch
                  id="mfa-required"
                  checked={form.mfaRequired}
                  onCheckedChange={(checked) => setForm({ mfaRequired: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limites e IPs permitidos</CardTitle>
              <CardDescription>
                Tamanho maximo de arquivo, tempo de inatividade da sessao e origens de rede
                autorizadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max-upload">Limite de upload (MB)</Label>
                  <Input
                    id="max-upload"
                    inputMode="numeric"
                    value={form.maxUploadMb}
                    onChange={(event) => setForm({ maxUploadMb: event.target.value })}
                  />
                  <p className="text-muted-foreground text-xs">
                    Entre {MIN_UPLOAD_MB} e {MAX_UPLOAD_MB} MB
                  </p>
                  <FieldError message={visibleErrors.maxUploadMb} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Timeout de sessao (min)</Label>
                  <Input
                    id="session-timeout"
                    inputMode="numeric"
                    value={form.sessionTimeoutMinutes}
                    onChange={(event) => setForm({ sessionTimeoutMinutes: event.target.value })}
                  />
                  <p className="text-muted-foreground text-xs">
                    Entre {MIN_SESSION_MINUTES} e {MAX_SESSION_MINUTES} minutos
                  </p>
                  <FieldError message={visibleErrors.sessionTimeoutMinutes} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed-ips">IPs permitidos</Label>
                <Textarea
                  id="allowed-ips"
                  value={form.allowedIps}
                  onChange={(event) => setForm({ allowedIps: event.target.value })}
                  placeholder={"200.10.20.30\n177.40.0.1"}
                />
                <p className="text-muted-foreground text-xs">
                  Um IP por linha. Deixe vazio para nao restringir por origem.
                </p>
                <FieldError message={visibleErrors.allowedIps} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Idiomas e aparencia</CardTitle>
              <CardDescription>
                Idioma padrao da interface e cores usadas pelo tema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Idiomas suportados</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((language) => {
                    const active = form.supportedLanguages.includes(language);
                    return (
                      <Button
                        key={language}
                        type="button"
                        size="sm"
                        variant={active ? "default" : "outline"}
                        aria-pressed={active}
                        onClick={() => toggleLanguage(language)}
                      >
                        {LANGUAGE_LABELS[language] ?? language}
                      </Button>
                    );
                  })}
                </div>
                <FieldError message={visibleErrors.supportedLanguages} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-language">Idioma padrao</Label>
                <div className="flex flex-wrap gap-2">
                  {form.supportedLanguages.map((language) => (
                    <Button
                      key={language}
                      type="button"
                      size="sm"
                      variant={form.defaultLanguage === language ? "default" : "outline"}
                      aria-pressed={form.defaultLanguage === language}
                      onClick={() => setForm({ defaultLanguage: language })}
                    >
                      {LANGUAGE_LABELS[language] ?? language}
                    </Button>
                  ))}
                </div>
                <FieldError message={visibleErrors.defaultLanguage} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Cor primaria</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="primary-color"
                      type="color"
                      className="h-10 w-16 p-1"
                      value={form.primaryColor}
                      onChange={(event) => setForm({ primaryColor: event.target.value })}
                    />
                    <Input
                      value={form.primaryColor}
                      onChange={(event) => setForm({ primaryColor: event.target.value })}
                    />
                  </div>
                  <FieldError message={visibleErrors.primaryColor} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Cor secundaria</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="secondary-color"
                      type="color"
                      className="h-10 w-16 p-1"
                      value={form.secondaryColor}
                      onChange={(event) => setForm({ secondaryColor: event.target.value })}
                    />
                    <Input
                      value={form.secondaryColor}
                      onChange={(event) => setForm({ secondaryColor: event.target.value })}
                    />
                  </div>
                  <FieldError message={visibleErrors.secondaryColor} />
                </div>
              </div>
            </CardContent>
          </Card>

          {showErrors && hasErrors && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Corrija os campos destacados antes de salvar</AlertTitle>
              <AlertDescription>
                Nenhuma alteracao foi enviada ao banco; o rascunho continua aqui.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={submit} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar configuracoes
            </Button>
            <Button variant="outline" onClick={reset} disabled={isSaving || !dirty} type="button">
              <RefreshCw className="mr-2 h-4 w-4" />
              Descartar rascunho
            </Button>
            {dirty && <Badge variant="secondary">alteracoes nao salvas</Badge>}
          </div>
        </>
      )}
    </div>
  );
}
