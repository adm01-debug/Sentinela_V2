import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, AlertTriangle, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  priority: 'required' | 'recommended';
}

const REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'Mínimo 8 caracteres',
    validator: (p) => p.length >= 8,
    priority: 'required',
  },
  {
    id: 'uppercase',
    label: 'Letra maiúscula (A-Z)',
    validator: (p) => /[A-Z]/.test(p),
    priority: 'required',
  },
  {
    id: 'lowercase',
    label: 'Letra minúscula (a-z)',
    validator: (p) => /[a-z]/.test(p),
    priority: 'required',
  },
  {
    id: 'number',
    label: 'Número (0-9)',
    validator: (p) => /[0-9]/.test(p),
    priority: 'required',
  },
  {
    id: 'special',
    label: 'Caractere especial (!@#$%...)',
    validator: (p) => /[^a-zA-Z0-9]/.test(p),
    priority: 'required',
  },
  {
    id: 'length12',
    label: '12+ caracteres (recomendado)',
    validator: (p) => p.length >= 12,
    priority: 'recommended',
  },
];

interface PasswordStrengthCheckerProps {
  password: string;
  onStrengthChange?: (isValid: boolean, score: number) => void;
  onLeakedCheck?: (isLeaked: boolean) => void;
  checkLeaked?: boolean;
  className?: string;
}

// SHA-1 hash function using Web Crypto API
async function sha1Hash(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Check if password has been leaked using Have I Been Pwned API (k-anonymity)
async function checkPasswordLeaked(password: string): Promise<{ leaked: boolean; count: number }> {
  try {
    const hash = await sha1Hash(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true', // Adds padding to prevent timing attacks
      },
    });
    
    if (!response.ok) {
      console.warn('HIBP API request failed');
      return { leaked: false, count: 0 };
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return { leaked: true, count: parseInt(countStr.trim(), 10) };
      }
    }
    
    return { leaked: false, count: 0 };
  } catch (error) {
    console.warn('Error checking leaked password:', error);
    return { leaked: false, count: 0 };
  }
}

export const PasswordStrengthChecker: React.FC<PasswordStrengthCheckerProps> = ({
  password,
  onStrengthChange,
  onLeakedCheck,
  checkLeaked = true,
  className,
}) => {
  const [leakStatus, setLeakStatus] = useState<{
    checked: boolean;
    loading: boolean;
    leaked: boolean;
    count: number;
  }>({
    checked: false,
    loading: false,
    leaked: false,
    count: 0,
  });

  // Calculate password strength
  const getStrength = useCallback(() => {
    const requiredMet = REQUIREMENTS
      .filter(r => r.priority === 'required')
      .filter(r => r.validator(password)).length;
    
    const totalRequired = REQUIREMENTS.filter(r => r.priority === 'required').length;
    const allRequiredMet = requiredMet === totalRequired;
    
    const recommendedMet = REQUIREMENTS
      .filter(r => r.priority === 'recommended')
      .filter(r => r.validator(password)).length;
    
    // Score calculation (0-100)
    const baseScore = (requiredMet / totalRequired) * 80;
    const bonusScore = recommendedMet * 10;
    const score = Math.min(100, baseScore + bonusScore);
    
    let label: string;
    let colorClass: string;
    
    if (score < 40) {
      label = 'Muito fraca';
      colorClass = 'text-destructive';
    } else if (score < 60) {
      label = 'Fraca';
      colorClass = 'text-orange-500';
    } else if (score < 80) {
      label = 'Média';
      colorClass = 'text-yellow-500';
    } else if (score < 100) {
      label = 'Forte';
      colorClass = 'text-green-500';
    } else {
      label = 'Muito forte';
      colorClass = 'text-emerald-500';
    }
    
    return { score, label, colorClass, allRequiredMet };
  }, [password]);

  const strength = getStrength();

  // Check for leaked passwords (debounced)
  useEffect(() => {
    if (!checkLeaked || password.length < 8) {
      setLeakStatus({ checked: false, loading: false, leaked: false, count: 0 });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLeakStatus(prev => ({ ...prev, loading: true }));
      
      const result = await checkPasswordLeaked(password);
      
      setLeakStatus({
        checked: true,
        loading: false,
        leaked: result.leaked,
        count: result.count,
      });
      
      onLeakedCheck?.(result.leaked);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [password, checkLeaked, onLeakedCheck]);

  // Notify parent of strength changes
  useEffect(() => {
    const isValid = strength.allRequiredMet && !leakStatus.leaked;
    onStrengthChange?.(isValid, strength.score);
  }, [strength, leakStatus.leaked, onStrengthChange]);

  if (!password) return null;

  const getProgressColor = () => {
    if (strength.score < 40) return 'bg-destructive';
    if (strength.score < 60) return 'bg-orange-500';
    if (strength.score < 80) return 'bg-yellow-500';
    if (strength.score < 100) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Força da senha</span>
          <span className={cn('font-medium', strength.colorClass)}>{strength.label}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300 rounded-full', getProgressColor())}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements list */}
      <div className="space-y-1">
        {REQUIREMENTS.map((req) => {
          const met = req.validator(password);
          return (
            <div
              key={req.id}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors',
                met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              )}
            >
              {met ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50" />
              )}
              <span className={cn(req.priority === 'recommended' && 'italic')}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Leaked password check */}
      {checkLeaked && password.length >= 8 && (
        <div className="pt-2 border-t border-border">
          {leakStatus.loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Verificando vazamentos...</span>
            </div>
          ) : leakStatus.checked ? (
            leakStatus.leaked ? (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
                <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Senha comprometida!</p>
                  <p className="text-destructive/80">
                    Esta senha apareceu em {leakStatus.count.toLocaleString('pt-BR')} vazamentos de dados. 
                    Escolha outra senha.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Senha não encontrada em vazamentos conhecidos</span>
              </div>
            )
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthChecker;
