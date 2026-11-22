// ============================================================
// RESET PASSWORD PAGE - redefine a senha com a sessao de recovery
// ============================================================
// O link do email (supabase.auth.admin.generateLink 'recovery' ou
// resetPasswordForEmail) volta para /reset-password#access_token=...&type=recovery.
// O supabase-js consome esse fragmento e abre uma sessao de recovery; esta pagina
// exige essa sessao para trocar a senha e nao depende do GuestGuard.

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthChecker } from "@/components/auth/PasswordStrengthChecker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ROUTES } from "@/constants/routes";

/** Erros do Supabase que significam "o link de recovery nao vale mais". */
const LINK_ERROR_PATTERNS = [
  "expired",
  "invalid",
  "otp_expired",
  "access_denied",
  "token has expired",
];

/** Le o erro do link (expirado/usado) direto no hash da URL, antes do primeiro render. */
function readLinkErrorFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const errorCode = hash.get("error_code");
  const errorDescription = hash.get("error_description");
  if (!errorCode && !errorDescription) return null;

  const raw = `${errorCode ?? ""} ${errorDescription ?? ""}`.toLowerCase();
  const isLinkProblem = LINK_ERROR_PATTERNS.some((p) => raw.includes(p));
  return isLinkProblem
    ? "Este link de redefinicao expirou ou ja foi usado. Solicite um novo."
    : (errorDescription ?? "Nao foi possivel validar o link de redefinicao.");
}

function isPasswordStrong(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, isAuthenticated, isLoading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [linkError] = useState<string | null>(readLinkErrorFromHash);

  const hasRecoverySession = Boolean(session?.user);
  const canSubmit = useMemo(
    () => isPasswordStrong(password) && password === confirmPassword && !isSubmitting,
    [password, confirmPassword, isSubmitting]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong(password)) {
      toast({
        title: "Senha fraca",
        description: "Use ao menos 8 caracteres com maiuscula, minuscula, numero e simbolo.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "As senhas nao coincidem", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setDone(true);
    toast({ title: "Senha atualizada!", description: "Use a nova senha para entrar." });
  };

  // Encerra a sessao de recovery e volta ao login com a senha nova.
  const goToLogin = async () => {
    await supabase.auth.signOut();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">Senha redefinida</h2>
              <p className="text-muted-foreground">
                Sua nova senha ja esta ativa. Entre novamente com ela.
              </p>
              <Button className="w-full" onClick={goToLogin}>
                Ir para o login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (linkError || !hasRecoverySession) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-destructive/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-6 w-6" />
            </div>
            <CardTitle>Link invalido</CardTitle>
            <CardDescription>
              {linkError ?? "Abra esta pagina pelo link enviado ao seu email."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-col gap-3">
            <Button asChild className="w-full">
              <Link to={ROUTES.FORGOT_PASSWORD}>Solicitar novo link</Link>
            </Button>
            <Link to={ROUTES.LOGIN} className="text-muted-foreground hover:text-primary text-sm">
              Voltar ao login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <Lock className="text-primary h-6 w-6" />
          </div>
          <CardTitle>Definir nova senha</CardTitle>
          <CardDescription>
            {isAuthenticated ? "Voce esta autenticado. " : ""}
            Escolha uma senha forte para a conta {session?.user?.email ?? ""}.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <PasswordStrengthChecker password={password} checkLeaked={false} />
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar senha</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-destructive text-sm">As senhas nao coincidem</p>
              )}
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Ao redefinir, todas as sessoes antigas continuam validas. Saia dos outros
                dispositivos se desconfiar de acesso indevido.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar nova senha"
              )}
            </Button>
            <Link to={ROUTES.LOGIN} className="text-muted-foreground hover:text-primary text-sm">
              Voltar ao login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
