import { useEffect, useState } from "react";
import { Shield, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Classifier {
  id: string;
  code: string;
  name: string;
  category: string;
  default_severity: string;
  default_action: string;
}

interface Policy {
  id: string;
  name: string;
  description: string | null;
  classifier_id: string | null;
  custom_pattern: string | null;
  keywords: string[] | null;
  severity: string;
  action: string;
  scope: string[];
  is_active: boolean;
}

const severityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

const actionLabel: Record<string, string> = {
  alert: "Alertar",
  redact: "Redigir",
  block: "Bloquear",
};

export default function DLPPoliciesPage() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [classifiers, setClassifiers] = useState<Classifier[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    classifier_id: "",
    severity: "medium",
    action: "alert",
    scope_clipboard: true,
    scope_screenshot: true,
    keywords: "",
  });

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;

      const { data: uc } = await supabase
        .from("user_companies")
        .select("company_id")
        .eq("user_id", u.user.id)
        .maybeSingle();
      const cid = uc?.company_id ?? null;
      setCompanyId(cid);

      const [{ data: cls }, { data: pol }] = await Promise.all([
        supabase
          .from("dlp_classifiers")
          .select("id, code, name, category, default_severity, default_action")
          .eq("is_active", true)
          .order("category"),
        cid
          ? supabase
              .from("dlp_policies")
              .select("*")
              .eq("company_id", cid)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] as Policy[] }),
      ]);

      setClassifiers((cls as Classifier[]) || []);
      setPolicies((pol as Policy[]) || []);
    } finally {
      setLoading(false);
    }
  }

  async function togglePolicy(id: string, value: boolean) {
    const { error } = await supabase.from("dlp_policies").update({ is_active: value }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: value } : p)));
  }

  async function createPolicy() {
    if (!companyId) {
      toast({
        title: "Erro",
        description: "Empresa não vinculada ao usuário",
        variant: "destructive",
      });
      return;
    }
    if (!form.name.trim() || !form.classifier_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Informe nome e classifier.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const scope: string[] = [];
    if (form.scope_clipboard) scope.push("clipboard");
    if (form.scope_screenshot) scope.push("screenshot");

    const keywords = form.keywords
      .split(/[\n,]/)
      .map((k) => k.trim())
      .filter(Boolean);

    const { error } = await supabase.from("dlp_policies").insert({
      company_id: companyId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      classifier_id: form.classifier_id || null,
      keywords: keywords.length > 0 ? keywords : null,
      severity: form.severity,
      action: form.action,
      scope: scope.length > 0 ? scope : ["clipboard"],
      is_active: true,
    });
    setSaving(false);

    if (error) {
      toast({
        title: "Erro ao criar política",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Política criada", description: form.name });
    setOpen(false);
    setForm({
      name: "",
      description: "",
      classifier_id: "",
      severity: "medium",
      action: "alert",
      scope_clipboard: true,
      scope_screenshot: true,
      keywords: "",
    });
    void load();
  }

  const classifierName = (id: string | null) => classifiers.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Shield className="h-6 w-6 text-primary" /> DLP — Políticas
          </h1>
          <p className="text-sm text-muted-foreground">
            Inspeção de dados sensíveis em clipboard e screenshots no agente desktop.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova política
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova política DLP</DialogTitle>
              <DialogDescription>
                Selecione um classifier e a ação a ser tomada quando dados sensíveis forem
                detectados.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <Label htmlFor="dlp-name">Nome</Label>
                <Input
                  id="dlp-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Bloquear cartões de crédito"
                />
              </div>

              <div>
                <Label htmlFor="dlp-classifier">Classifier</Label>
                <Select
                  value={form.classifier_id}
                  onValueChange={(v) => setForm({ ...form, classifier_id: v })}
                >
                  <SelectTrigger id="dlp-classifier">
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                  <SelectContent>
                    {classifiers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} <span className="text-muted-foreground">({c.category})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Severidade</Label>
                  <Select
                    value={form.severity}
                    onValueChange={(v) => setForm({ ...form, severity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ação</Label>
                  <Select
                    value={form.action}
                    onValueChange={(v) => setForm({ ...form, action: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alert">Apenas alertar</SelectItem>
                      <SelectItem value="redact">Redigir</SelectItem>
                      <SelectItem value="block">Bloquear</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={form.scope_clipboard}
                    onCheckedChange={(v) => setForm({ ...form, scope_clipboard: v })}
                  />
                  Clipboard
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={form.scope_screenshot}
                    onCheckedChange={(v) => setForm({ ...form, scope_screenshot: v })}
                  />
                  Screenshot
                </span>
              </div>

              <div>
                <Label htmlFor="dlp-keywords">Palavras-chave adicionais (opcional)</Label>
                <Textarea
                  id="dlp-keywords"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  placeholder="Uma por linha ou separadas por vírgula"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="dlp-desc">Descrição (opcional)</Label>
                <Textarea
                  id="dlp-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={createPolicy} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar política
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Classifiers disponíveis</CardTitle>
          <CardDescription>
            Detectores pré-configurados para dados sensíveis brasileiros e segredos comuns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {classifiers.map((c) => (
              <Badge key={c.id} variant="outline" className="gap-1">
                {c.name}
                <span
                  className={`ml-1 rounded px-1 text-[10px] ${severityColor[c.default_severity]}`}
                >
                  {c.default_severity}
                </span>
              </Badge>
            ))}
            {classifiers.length === 0 && (
              <span className="text-sm text-muted-foreground">Nenhum classifier carregado.</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Políticas ativas</CardTitle>
          <CardDescription>
            {policies.length} política(s) configurada(s) para esta empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : policies.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma política criada. Clique em &quot;Nova política&quot; para começar.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Classifier</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Escopo</TableHead>
                  <TableHead className="text-right">Ativa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{classifierName(p.classifier_id)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={severityColor[p.severity]}>
                        {p.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{actionLabel[p.action]}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{p.scope.join(", ")}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={p.is_active}
                        onCheckedChange={(v) => togglePolicy(p.id, v)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
