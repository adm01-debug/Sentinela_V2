import React, { useState } from "react";
import { KeyRound, Loader2, CheckCircle2, Mail } from "lucide-react";
import { z } from "zod";
import { usePasswordResetRequests } from "@/hooks/usePasswordResetRequests";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const requestSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nome muito curto").optional(),
  reason: z.string().optional(),
});

export function PasswordResetRequestForm() {
  const { createRequest, isCreating } = usePasswordResetRequests();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = requestSchema.safeParse({
      email,
      name: name || undefined,
      reason: reason || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    createRequest(
      { email, name: name || undefined, reason: reason || undefined },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
      }
    );
  };

  if (submitted) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold">Solicitação Enviada!</h3>
            <p className="text-muted-foreground">
              Sua solicitação de redefinição de senha foi enviada para análise. Você receberá um
              email quando ela for aprovada.
            </p>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Fazer Nova Solicitação
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Solicitar Reset de Senha</CardTitle>
            <CardDescription>Sua solicitação será analisada por um administrador</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Seu Nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Por que você precisa redefinir sua senha?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Solicitar Redefinição
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Após aprovação, você receberá um email com instruções para redefinir sua senha.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
