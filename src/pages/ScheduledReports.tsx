import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScheduledReports } from "@/hooks/useScheduledReports";
import { Calendar, Clock, Mail, Send, Settings, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const daysOfWeek = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export default function ScheduledReports() {
  const { settings, loading, createOrUpdateSettings, sendTestReport } = useScheduledReports();
  const [sendingTest, setSendingTest] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState({ daily: "", weekly: "" });

  const dailySettings = settings.find((s) => s.report_type === "daily");
  const weeklySettings = settings.find((s) => s.report_type === "weekly");

  const [dailyForm, setDailyForm] = useState({
    enabled: dailySettings?.enabled ?? false,
    send_time: dailySettings?.send_time ?? "08:00:00",
    recipient_emails: dailySettings?.recipient_emails ?? [],
    include_violations: dailySettings?.include_violations ?? true,
    include_productivity: dailySettings?.include_productivity ?? true,
    include_activity_summary: dailySettings?.include_activity_summary ?? true,
  });

  const [weeklyForm, setWeeklyForm] = useState({
    enabled: weeklySettings?.enabled ?? false,
    send_time: weeklySettings?.send_time ?? "08:00:00",
    send_day_of_week: weeklySettings?.send_day_of_week ?? 1,
    recipient_emails: weeklySettings?.recipient_emails ?? [],
    include_violations: weeklySettings?.include_violations ?? true,
    include_productivity: weeklySettings?.include_productivity ?? true,
    include_activity_summary: weeklySettings?.include_activity_summary ?? true,
  });

  const handleAddEmail = (type: "daily" | "weekly") => {
    const email = newEmail[type].trim();
    if (!email || !email.includes("@")) return;

    if (type === "daily") {
      if (!dailyForm.recipient_emails.includes(email)) {
        setDailyForm((prev) => ({
          ...prev,
          recipient_emails: [...prev.recipient_emails, email],
        }));
      }
    } else {
      if (!weeklyForm.recipient_emails.includes(email)) {
        setWeeklyForm((prev) => ({
          ...prev,
          recipient_emails: [...prev.recipient_emails, email],
        }));
      }
    }
    setNewEmail((prev) => ({ ...prev, [type]: "" }));
  };

  const handleRemoveEmail = (type: "daily" | "weekly", email: string) => {
    if (type === "daily") {
      setDailyForm((prev) => ({
        ...prev,
        recipient_emails: prev.recipient_emails.filter((e) => e !== email),
      }));
    } else {
      setWeeklyForm((prev) => ({
        ...prev,
        recipient_emails: prev.recipient_emails.filter((e) => e !== email),
      }));
    }
  };

  const handleSaveDaily = async () => {
    await createOrUpdateSettings("daily", dailyForm);
  };

  const handleSaveWeekly = async () => {
    await createOrUpdateSettings("weekly", weeklyForm);
  };

  const handleSendTest = async (type: "daily" | "weekly") => {
    setSendingTest(type);
    await sendTestReport(type);
    setSendingTest(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios Agendados</h1>
            <p className="text-muted-foreground mt-1">
              Configure o envio automático de relatórios por email
            </p>
          </div>

          {/* Daily Report Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>Relatório Diário</CardTitle>
                    <CardDescription>
                      Resumo das últimas 24 horas
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={dailyForm.enabled}
                  onCheckedChange={(checked) => setDailyForm((prev) => ({ ...prev, enabled: checked }))}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário de Envio
                  </Label>
                  <Input
                    type="time"
                    value={dailyForm.send_time.slice(0, 5)}
                    onChange={(e) => setDailyForm((prev) => ({ ...prev, send_time: e.target.value + ":00" }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Destinatários
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newEmail.daily}
                    onChange={(e) => setNewEmail((prev) => ({ ...prev, daily: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAddEmail("daily")}
                  />
                  <Button onClick={() => handleAddEmail("daily")} variant="outline">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dailyForm.recipient_emails.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveEmail("daily", email)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Incluir no Relatório</Label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={dailyForm.include_violations}
                      onCheckedChange={(checked) => setDailyForm((prev) => ({ ...prev, include_violations: checked }))}
                    />
                    <span className="text-sm">Violações</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={dailyForm.include_productivity}
                      onCheckedChange={(checked) => setDailyForm((prev) => ({ ...prev, include_productivity: checked }))}
                    />
                    <span className="text-sm">Produtividade</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={dailyForm.include_activity_summary}
                      onCheckedChange={(checked) => setDailyForm((prev) => ({ ...prev, include_activity_summary: checked }))}
                    />
                    <span className="text-sm">Resumo de Atividades</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {dailySettings?.last_sent_at ? (
                    <>Último envio: {format(new Date(dailySettings.last_sent_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</>
                  ) : (
                    "Nenhum relatório enviado ainda"
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSendTest("daily")}
                    disabled={sendingTest === "daily" || dailyForm.recipient_emails.length === 0}
                  >
                    {sendingTest === "daily" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Enviar Agora
                  </Button>
                  <Button onClick={handleSaveDaily}>
                    <Settings className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Report Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle>Relatório Semanal</CardTitle>
                    <CardDescription>
                      Resumo completo dos últimos 7 dias
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={weeklyForm.enabled}
                  onCheckedChange={(checked) => setWeeklyForm((prev) => ({ ...prev, enabled: checked }))}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dia da Semana</Label>
                  <Select
                    value={String(weeklyForm.send_day_of_week)}
                    onValueChange={(value) => setWeeklyForm((prev) => ({ ...prev, send_day_of_week: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day.value} value={String(day.value)}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário de Envio
                  </Label>
                  <Input
                    type="time"
                    value={weeklyForm.send_time.slice(0, 5)}
                    onChange={(e) => setWeeklyForm((prev) => ({ ...prev, send_time: e.target.value + ":00" }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Destinatários
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newEmail.weekly}
                    onChange={(e) => setNewEmail((prev) => ({ ...prev, weekly: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAddEmail("weekly")}
                  />
                  <Button onClick={() => handleAddEmail("weekly")} variant="outline">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {weeklyForm.recipient_emails.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveEmail("weekly", email)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Incluir no Relatório</Label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={weeklyForm.include_violations}
                      onCheckedChange={(checked) => setWeeklyForm((prev) => ({ ...prev, include_violations: checked }))}
                    />
                    <span className="text-sm">Violações</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={weeklyForm.include_productivity}
                      onCheckedChange={(checked) => setWeeklyForm((prev) => ({ ...prev, include_productivity: checked }))}
                    />
                    <span className="text-sm">Produtividade</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={weeklyForm.include_activity_summary}
                      onCheckedChange={(checked) => setWeeklyForm((prev) => ({ ...prev, include_activity_summary: checked }))}
                    />
                    <span className="text-sm">Resumo de Atividades</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {weeklySettings?.last_sent_at ? (
                    <>Último envio: {format(new Date(weeklySettings.last_sent_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</>
                  ) : (
                    "Nenhum relatório enviado ainda"
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSendTest("weekly")}
                    disabled={sendingTest === "weekly" || weeklyForm.recipient_emails.length === 0}
                  >
                    {sendingTest === "weekly" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Enviar Agora
                  </Button>
                  <Button onClick={handleSaveWeekly}>
                    <Settings className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Sobre o Agendamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Os relatórios são enviados automaticamente nos horários configurados. 
                    Certifique-se de que os emails dos destinatários estão corretos e que 
                    o domínio de envio está configurado no Resend para evitar que os emails 
                    sejam marcados como spam.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
