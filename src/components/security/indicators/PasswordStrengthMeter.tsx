import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  textColor: string;
}

const getPasswordStrength = (password: string): StrengthResult => {
  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;

  if (score >= 80) return { score, label: 'Forte', color: 'bg-success', textColor: 'text-success' };
  if (score >= 60) return { score, label: 'Boa', color: 'bg-primary', textColor: 'text-primary' };
  if (score >= 40) return { score, label: 'Razoável', color: 'bg-warning', textColor: 'text-warning' };
  return { score, label: 'Fraca', color: 'bg-destructive', textColor: 'text-destructive' };
};

const REQUIREMENTS: ReadonlyArray<{ test: (p: string) => boolean; label: string }> = [
  { test: (p) => p.length >= 8, label: 'Pelo menos 8 caracteres' },
  { test: (p) => /[A-Z]/.test(p), label: 'Uma letra maiúscula' },
  { test: (p) => /[0-9]/.test(p), label: 'Um número' },
  { test: (p) => /[^a-zA-Z0-9]/.test(p), label: 'Um caractere especial' },
];

export const PasswordStrengthMeter: React.FC<PasswordStrengthProps> = ({
  password,
  className,
}) => {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const requirements = useMemo(
    () => REQUIREMENTS.map((r) => ({ ...r, passed: r.test(password) })),
    [password],
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Força da senha</span>
        <span className={strength.textColor} aria-live="polite">
          {strength.label}
        </span>
      </div>
      <div
        className="h-2 bg-muted rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={strength.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Força da senha: ${strength.label}`}
      >
        <div
          className={cn('h-full transition-all duration-300', strength.color)}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      <ul className="text-xs text-muted-foreground space-y-1">
        {requirements.map(({ passed, label }) => (
          <li key={label} className="flex items-center gap-1.5">
            {passed ? (
              <CheckCircle className="h-3 w-3 text-success shrink-0" aria-hidden="true" />
            ) : (
              <XCircle className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden="true" />
            )}
            <span className={passed ? 'text-foreground' : undefined}>{label}</span>
            <span className="sr-only">{passed ? '(atendido)' : '(pendente)'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
