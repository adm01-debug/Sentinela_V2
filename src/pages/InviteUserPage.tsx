// ============================================================
// CONVITE DE USUARIO - cria login, papel e vinculo de empresa
// ============================================================
// O botao "Convidar" de /admin/users apontava para /users/invite, rota que nao
// existia (404), e o hook `useInviteUser` era um stub que devolvia o payload sem
// chamar nada. Esta tela chama a edge `admin-invite-user`, que cria o usuario no
// auth, grava o papel em `user_roles` e vincula a empresa de quem convidou.

import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInviteUser } from "@/hooks/useUsers";
import { ROUTES } from "@/constants/routes";

// `AdminGuard`/AuthProvider aceitam 'admin' e 'Admin'; o banco de producao usa
// 'Admin'. A edge valida a lista completa de papeis do enum.
const PAPERS = [
  { value: "user", label: "Usuario", hint: "Acesso as telas do dia a dia" },
  { value: "Admin", label: "Administrador", hint: "Gerencia usuarios, papeis e configuracoes" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function InviteUserPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");
  const [formError, setFormError] = useState<string | null>(null);
  const inviteUser = useInviteUser();

  const emailValid = EMAIL_PATTERN.test(email.trim());

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!emailValid) {
      setFormError("Informe um e-mail valido.");
      return;
    }
    inviteUser.mutate(
      { email: email.trim(), role, full_name: fullName.trim() || undefined },
      {
        onError: (error) => setFormError((error as Error).message),
      }
    );
  };

  const enviado = inviteUser.isSuccess;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convidar usuario"
        description="Cria o acesso, define o papel e vincula a empresa do seu usuario."
      />

      {enviado && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Convite enviado</AlertTitle>
          <AlertDescription>
            Enviamos o link para <strong>{inviteUser.data?.email}</strong>. O convidado define a
            senha ao abrir o link; o papel aplicado foi <strong>{inviteUser.data?.role}</strong>.
          </AlertDescription>
        </Alert>
      )}

      {formError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Nao foi possivel convidar</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados do convidado</CardTitle>
          <CardDescription>
            O e-mail precisa ser novo: um convite para e-mail ja cadastrado e recusado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid gap-2">
              <Label htmlFor="invite-email">E-mail</Label>
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                placeholder="pessoa@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invite-name">Nome (opcional)</Label>
              <Input
                id="invite-name"
                placeholder="Nome que aparece na lista de usuarios"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={120}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invite-role">Papel</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAPERS.map((paper) => (
                    <SelectItem key={paper.value} value={paper.value}>
                      {paper.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {PAPERS.find((paper) => paper.value === role)?.hint}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" className="gap-2" disabled={inviteUser.isPending}>
                {inviteUser.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {inviteUser.isPending ? "Enviando..." : "Enviar convite"}
              </Button>
              <Button type="button" variant="outline" className="gap-2" asChild>
                <Link to={ROUTES.ADMIN_USERS}>
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para usuarios
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
