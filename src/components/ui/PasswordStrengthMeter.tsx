import * as React from 'react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, AlertTriangle, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

export interface PasswordStrengthMeterProps {
  password: string;
  minLength?: number;
  showRequirements?: boolean;
  showScore?: boolean;
  className?: string;
  onChange?: (strength: PasswordStrength) => void;
}

export interface PasswordStrength {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  feedback: string[];
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

const STRENGTH_LEVELS = {
  0: { level: 'weak', color: 'bg-red-500', label: 'Weak', icon: ShieldAlert },
  1: { level: 'fair', color: 'bg-orange-500', label: 'Fair', icon: AlertTriangle },
  2: { level: 'good', color: 'bg-yellow-500', label: 'Good', icon: Shield },
  3: { level: 'strong', color: 'bg-green-500', label: 'Strong', icon: ShieldCheck },
  4: { level: 'excellent', color: 'bg-emerald-500', label: 'Excellent', icon: ShieldCheck },
} as const;

export function PasswordStrengthMeter({
  password,
  minLength = 8,
  showRequirements = true,
  showScore = true,
  className,
  onChange,
}: PasswordStrengthMeterProps) {
  const strength = useMemo(() => {
    const requirements: PasswordRequirement[] = [
      { id: 'length', label: `At least ${minLength} characters`, met: password.length >= minLength },
      { id: 'lowercase', label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { id: 'uppercase', label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { id: 'number', label: 'Contains number', met: /[0-9]/.test(password) },
      { id: 'special', label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const metCount = requirements.filter(r => r.met).length;
    const score = Math.min(4, metCount);
    const levelData = STRENGTH_LEVELS[score as keyof typeof STRENGTH_LEVELS];

    const feedback: string[] = [];
    if (!requirements[0].met) feedback.push(`Add ${minLength - password.length} more characters`);
    if (!requirements[1].met) feedback.push('Add a lowercase letter');
    if (!requirements[2].met) feedback.push('Add an uppercase letter');
    if (!requirements[3].met) feedback.push('Add a number');
    if (!requirements[4].met) feedback.push('Add a special character');

    const result: PasswordStrength = {
      score,
      level: levelData.level as PasswordStrength['level'],
      feedback,
      requirements,
    };

    return result;
  }, [password, minLength]);

  React.useEffect(() => {
    onChange?.(strength);
  }, [strength, onChange]);

  if (!password) return null;

  const levelData = STRENGTH_LEVELS[strength.score as keyof typeof STRENGTH_LEVELS];
  const Icon = levelData.icon;

  return (
    <div className={cn('space-y-3', className)}>
      {showScore && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Password strength</span>
            <span className={cn('flex items-center gap-1 text-sm font-medium', {
              'text-red-500': strength.level === 'weak',
              'text-orange-500': strength.level === 'fair',
              'text-yellow-500': strength.level === 'good',
              'text-green-500': strength.level === 'strong',
              'text-emerald-500': strength.level === 'excellent',
            })}>
              <Icon className="h-4 w-4" />
              {levelData.label}
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  index <= strength.score ? levelData.color : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>
      )}

      {showRequirements && (
        <ul className="space-y-1.5">
          {strength.requirements.map((req) => (
            <li key={req.id} className="flex items-center gap-2 text-sm">
              {req.met ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={cn(req.met ? 'text-green-600' : 'text-muted-foreground')}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PasswordStrengthMeter;
