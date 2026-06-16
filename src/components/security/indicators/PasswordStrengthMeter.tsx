import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

const getPasswordStrength = (
  password: string
): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;

  if (score >= 80) return { score, label: "Strong", color: "bg-success" };
  if (score >= 60) return { score, label: "Good", color: "bg-info" };
  if (score >= 40) return { score, label: "Fair", color: "bg-warning" };
  return { score, label: "Weak", color: "bg-destructive" };
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthProps> = ({ password, className }) => {
  const strength = getPasswordStrength(password);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Password strength</span>
        <span
          className={cn(
            strength.score >= 60
              ? "text-success"
              : strength.score >= 40
                ? "text-warning"
                : "text-destructive"
          )}
        >
          {strength.label}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-300", strength.color)}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {[
          { test: password.length >= 8, label: "At least 8 characters" },
          { test: /[A-Z]/.test(password), label: "One uppercase letter" },
          { test: /[0-9]/.test(password), label: "One number" },
          { test: /[^a-zA-Z0-9]/.test(password), label: "One special character" },
        ].map(({ test, label }) => (
          <li key={label} className="flex items-center gap-1">
            {test ? (
              <CheckCircle className="h-3 w-3 text-success" />
            ) : (
              <XCircle className="h-3 w-3 text-muted-foreground" />
            )}
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};
