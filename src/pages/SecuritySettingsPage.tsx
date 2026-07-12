import { Shield, Key, Lock, Smartphone, Loader2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { MFASettings } from '@/components/MFASettings';
import { BlockedIPsPanel } from '@/components/BlockedIPsPanel';
import { PageHeader } from '@/components/layout/PageHeader';
import { supabase } from '@/integrations/supabase/client';
import { passwordSchema } from '@/lib/schemas';
import { logger } from '@/lib/logger';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe sua senha atual'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'A nova senha deve ser diferente da atual',
    path: ['newPassword'],
  });

type FormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function getStrength(password: string): { score: number; label: string; tone: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: 'Muito fraca', tone: 'bg-destructive' },
    { label: 'Fraca', tone: 'bg-destructive' },
    { label: 'Razoável', tone: 'bg-warning' },
    { label: 'Boa', tone: 'bg-warning' },
    { label: 'Forte', tone: 'bg-success' },
    { label: 'Excelente', tone: 'bg-success' },
  ];
  return { score, ...map[score] };
}

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const strength = useMemo(() => getStrength(form.newPassword), [form.newPassword]);

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const parsed = changePasswordSchema.safeParse(form);
      if (!parsed.success) {
        const fieldErrors: FieldErrors = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof FormState;
          if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
        return;
      }

      setSubmitting(true);
      try {
        // Reautenticação: valida a senha atual antes de permitir a troca.
        const { data: sessionData } = await supabase.auth.getUser();
        const email = sessionData.user?.email;
        if (!email) {
          throw new Error('Sessão inválida. Faça login novamente.');
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: parsed.data.currentPassword,
        });
        if (signInError) {
          setErrors({ currentPassword: 'Senha atual incorreta' });
          return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: parsed.data.newPassword,
        });
        if (updateError) throw updateError;

        toast({
          title: 'Senha atualizada com sucesso',
          description: 'Use sua nova senha nos próximos acessos.',
        });
        setForm(INITIAL_FORM);
        setErrors({});
      } catch (error) {
        logger.error('Falha ao alterar senha', error);
        toast({
          title: 'Não foi possível alterar a senha',
          description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
          variant: 'destructive',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [form, toast],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações de Segurança"
        description="Configure autenticação, senha e proteção da conta"
        showBackButton={false}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" aria-hidden="true" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Sua senha deve conter no mínimo 8 caracteres. Recomendamos combinar letras, números e
            símbolos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input
                id="current-password"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={(e) => updateField('currentPassword', e.target.value)}
                aria-invalid={!!errors.currentPassword}
                aria-describedby={errors.currentPassword ? 'current-password-error' : undefined}
                disabled={submitting}
              />
              {errors.currentPassword && (
                <p id="current-password-error" className="text-sm text-destructive">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.newPassword}
                onChange={(e) => updateField('newPassword', e.target.value)}
                aria-invalid={!!errors.newPassword}
                aria-describedby={
                  errors.newPassword ? 'new-password-error' : 'new-password-strength'
                }
                disabled={submitting}
              />
              {form.newPassword && (
                <div
                  id="new-password-strength"
                  className="flex items-center gap-2"
                  aria-live="polite"
                >
                  <div className="flex flex-1 gap-1" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < strength.score ? strength.tone : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{strength.label}</span>
                </div>
              )}
              {errors.newPassword && (
                <p id="new-password-error" className="text-sm text-destructive">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                disabled={submitting}
              />
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Atualizando...
                  </>
                ) : (
                  'Alterar senha'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswords((v) => !v)}
                aria-pressed={showPasswords}
              >
                {showPasswords ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" aria-hidden="true" />
                    Ocultar senhas
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                    Mostrar senhas
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" aria-hidden="true" />
            Autenticação em duas etapas (MFA)
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de proteção usando um aplicativo autenticador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MFASettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" aria-hidden="true" />
            IPs bloqueados
          </CardTitle>
          <CardDescription>
            Gerencie endereços de IP com acesso restrito à sua organização.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlockedIPsPanel />
        </CardContent>
      </Card>
    </div>
  );
}

export { SecuritySettingsPage };
