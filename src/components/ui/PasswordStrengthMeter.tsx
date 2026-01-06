import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X, AlertCircle } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
  minLength?: number;
  onStrengthChange?: (strength: number) => void;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const getStrengthColor = (strength: number): string => {
  if (strength <= 1) return "bg-red-500";
  if (strength === 2) return "bg-orange-500";
  if (strength === 3) return "bg-yellow-500";
  if (strength === 4) return "bg-lime-500";
  return "bg-green-500";
};

const getStrengthLabel = (strength: number): string => {
  if (strength <= 1) return "Muito fraca";
  if (strength === 2) return "Fraca";
  if (strength === 3) return "Média";
  if (strength === 4) return "Forte";
  return "Muito forte";
};

export function PasswordStrengthMeter({
  password,
  className,
  showRequirements = true,
  minLength = 8,
  onStrengthChange,
}: PasswordStrengthMeterProps) {
  const requirements: Requirement[] = React.useMemo(() => [
    { label: `Mínimo ${minLength} caracteres`, test: (p) => p.length >= minLength },
    { label: "Letra minúscula", test: (p) => /[a-z]/.test(p) },
    { label: "Letra maiúscula", test: (p) => /[A-Z]/.test(p) },
    { label: "Número", test: (p) => /[0-9]/.test(p) },
    { label: "Caractere especial", test: (p) => /[^A-Za-z0-9]/.test(p) },
  ], [minLength]);

  const strength = React.useMemo(() => {
    return requirements.filter((req) => req.test(password)).length;
  }, [password, requirements]);

  React.useEffect(() => {
    onStrengthChange?.(strength);
  }, [strength, onStrengthChange]);

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <div className="flex gap-1 h-1.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                "flex-1 rounded-full transition-colors duration-300",
                strength >= level ? getStrengthColor(strength) : "bg-muted"
              )}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className={cn("font-medium", strength <= 2 ? "text-red-500" : strength <= 3 ? "text-yellow-500" : "text-green-500")}>
            {getStrengthLabel(strength)}
          </span>
          <span className="text-muted-foreground">{strength}/5 requisitos</span>
        </div>
      </div>

      {showRequirements && (
        <ul className="space-y-1.5">
          {requirements.map((req, index) => {
            const passed = req.test(password);
            return (
              <li key={index} className={cn("flex items-center gap-2 text-xs transition-colors", passed ? "text-green-600" : "text-muted-foreground")}>
                {passed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                <span>{req.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function PasswordStrengthIndicator({ password }: { password: string }) {
  return <PasswordStrengthMeter password={password} showRequirements={false} />;
}

export default PasswordStrengthMeter;
