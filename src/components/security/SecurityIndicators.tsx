import React from 'react';
import { cn } from '@/lib/utils';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Fingerprint,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Laptop,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Security Score Dashboard
interface SecurityScoreProps {
  score: number;
  label?: string;
  showDetails?: boolean;
  className?: string;
}

export const SecurityScore: React.FC<SecurityScoreProps> = ({
  score,
  label = 'Security Score',
  showDetails = true,
  className,
}) => {
  const getScoreColor = (s) => {
    if (s >= 80) return { color: 'text-success', bg: 'bg-success', label: 'Excellent' };
    if (s >= 60) return { color: 'text-info', bg: 'bg-info', label: 'Good' };
    if (s >= 40) return { color: 'text-warning', bg: 'bg-warning', label: 'Fair' };
    return { color: 'text-destructive', bg: 'bg-destructive', label: 'Critical' };
  };

  const scoreInfo = getScoreColor(score);

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Shield className={cn('h-5 w-5', scoreInfo.color)} />
      </div>
      
      <div className="flex items-end gap-2 mb-4">
        <span className={cn('text-4xl font-bold', scoreInfo.color)}>{score}</span>
        <span className="text-lg text-muted-foreground mb-1">/100</span>
      </div>

      <Progress value={score} className="h-2 mb-2" />
      
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <Badge variant={score >= 60 ? 'default' : 'destructive'}>
            {scoreInfo.label}
          </Badge>
          <span className="text-muted-foreground">Last updated: now</span>
        </div>
      )}
    </Card>
  );
};

// Threat Level Badge
type ThreatLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

interface ThreatLevelBadgeProps {
  level: ThreatLevel;
  showIcon?: boolean;
  className?: string;
}

const threatConfig: Record<ThreatLevel, { 
  icon: typeof ShieldCheck;
  label: string;
  variant: 'destructive' | 'secondary' | 'default' | 'outline';
  className: string;
}> = {
  critical: { icon: ShieldX, label: 'Critical', variant: 'destructive', className: 'animate-pulse' },
  high: { icon: ShieldAlert, label: 'High', variant: 'destructive', className: '' },
  medium: { icon: AlertTriangle, label: 'Medium', variant: 'secondary', className: 'bg-warning text-warning-foreground' },
  low: { icon: Info, label: 'Low', variant: 'secondary', className: 'bg-info/10 text-info' },
  none: { icon: ShieldCheck, label: 'None', variant: 'outline', className: 'bg-success/10 text-success' },
};

export const ThreatLevelBadge: React.FC<ThreatLevelBadgeProps> = ({
  level,
  showIcon = true,
  className,
}) => {
  const config = threatConfig[level];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={cn(config.className, className)}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
};

// Session Activity Item
interface SessionActivityProps {
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
  lastActive: string;
  isCurrent?: boolean;
  isSecure?: boolean;
  onRevoke?: () => void;
}

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Laptop,
};

export const SessionActivityItem: React.FC<SessionActivityProps> = ({
  device,
  deviceType,
  location,
  lastActive,
  isCurrent = false,
  isSecure = true,
}) => {
  const DeviceIcon = deviceIcons[deviceType];

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-elevation-1 transition-shadow">
      <div className="flex items-center gap-4">
        <div className={cn(
          'p-2 rounded-lg',
          isCurrent ? 'bg-primary/10' : 'bg-muted'
        )}>
          <DeviceIcon className={cn(
            'h-5 w-5',
            isCurrent ? 'text-primary' : 'text-muted-foreground'
          )} />
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{device}</span>
            {isCurrent && (
              <Badge variant="secondary" className="text-xs">Current</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{location}</span>
            <span>•</span>
            <span>{lastActive}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isSecure ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Lock className="h-4 w-4 text-success" />
              </TooltipTrigger>
              <TooltipContent>Secure connection</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Unlock className="h-4 w-4 text-warning" />
              </TooltipTrigger>
              <TooltipContent>Connection not fully secure</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

// Device Trust Indicator
interface DeviceTrustProps {
  trusted: boolean;
  verified?: boolean;
  className?: string;
}

export const DeviceTrustIndicator: React.FC<DeviceTrustProps> = ({
  trusted,
  verified = false,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {trusted ? (
        <>
          <CheckCircle className="h-4 w-4 text-success" />
          <span className="text-sm text-success">Trusted Device</span>
          {verified && (
            <Badge variant="outline" className="text-xs">
              <Fingerprint className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Unverified Device</span>
        </>
      )}
    </div>
  );
};

// Encryption Status
interface EncryptionStatusProps {
  encrypted: boolean;
  algorithm?: string;
  className?: string;
}

export const EncryptionStatus: React.FC<EncryptionStatusProps> = ({
  encrypted,
  algorithm,
  className,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-2', className)}>
            {encrypted ? (
              <>
                <Lock className="h-4 w-4 text-success" />
                <span className="text-sm text-success">Encrypted</span>
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">Not Encrypted</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {encrypted 
            ? `Data encrypted${algorithm ? ` with ${algorithm}` : ''}`
            : 'Data is not encrypted'
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Password Strength Meter
interface PasswordStrengthProps {
  password: string;
  className?: string;
}

const getPasswordStrength = (password): {
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

  if (score >= 80) return { score, label: 'Strong', color: 'bg-success' };
  if (score >= 60) return { score, label: 'Good', color: 'bg-info' };
  if (score >= 40) return { score, label: 'Fair', color: 'bg-warning' };
  return { score, label: 'Weak', color: 'bg-destructive' };
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthProps> = ({
  password,
  className,
}) => {
  const strength = getPasswordStrength(password);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Password strength</span>
        <span className={cn(
          strength.score >= 60 ? 'text-success' : 
          strength.score >= 40 ? 'text-warning' : 'text-destructive'
        )}>
          {strength.label}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', strength.color)}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      <ul className="text-xs text-muted-foreground space-y-1">
        <li className="flex items-center gap-1">
          {password.length >= 8 ? (
            <CheckCircle className="h-3 w-3 text-success" />
          ) : (
            <XCircle className="h-3 w-3 text-muted-foreground" />
          )}
          At least 8 characters
        </li>
        <li className="flex items-center gap-1">
          {/[A-Z]/.test(password) ? (
            <CheckCircle className="h-3 w-3 text-success" />
          ) : (
            <XCircle className="h-3 w-3 text-muted-foreground" />
          )}
          One uppercase letter
        </li>
        <li className="flex items-center gap-1">
          {/[0-9]/.test(password) ? (
            <CheckCircle className="h-3 w-3 text-success" />
          ) : (
            <XCircle className="h-3 w-3 text-muted-foreground" />
          )}
          One number
        </li>
        <li className="flex items-center gap-1">
          {/[^a-zA-Z0-9]/.test(password) ? (
            <CheckCircle className="h-3 w-3 text-success" />
          ) : (
            <XCircle className="h-3 w-3 text-muted-foreground" />
          )}
          One special character
        </li>
      </ul>
    </div>
  );
};

// Risk Assessment Visualization
interface RiskItem {
  id: string;
  label: string;
  level: ThreatLevel;
  description: string;
}

interface RiskAssessmentProps {
  risks: RiskItem[];
  className?: string;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  risks,
  className,
}) => {
  const sortedRisks = [...risks].sort((a, b) => {
    const order: Record<ThreatLevel, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
    return order[a.level] - order[b.level];
  });

  return (
    <div className={cn('space-y-3', className)}>
      {sortedRisks.map((risk) => (
        <div
          key={risk.id}
          className="flex items-start gap-3 p-3 rounded-lg border bg-card"
        >
          <ThreatLevelBadge level={risk.level} />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{risk.label}</p>
            <p className="text-sm text-muted-foreground">{risk.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Two-Factor Authentication Status
interface TwoFactorStatusProps {
  enabled: boolean;
  methods?: string[];
  className?: string;
}

export const TwoFactorStatus: React.FC<TwoFactorStatusProps> = ({
  enabled,
  methods = [],
  className,
}) => {
  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg border',
      enabled ? 'bg-success/5 border-success/20' : 'bg-muted',
      className
    )}>
      <div className={cn(
        'p-2 rounded-full',
        enabled ? 'bg-success/10' : 'bg-muted'
      )}>
        <Key className={cn(
          'h-5 w-5',
          enabled ? 'text-success' : 'text-muted-foreground'
        )} />
      </div>
      
      <div className="flex-1">
        <p className="font-medium">
          Two-Factor Authentication
        </p>
        <p className="text-sm text-muted-foreground">
          {enabled 
            ? `Enabled with ${methods.join(', ')}` 
            : 'Not enabled - your account is less secure'
          }
        </p>
      </div>

      <Badge variant={enabled ? 'default' : 'secondary'}>
        {enabled ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  );
};

// Visibility Toggle for sensitive data
interface SensitiveDataProps {
  data: string;
  className?: string;
}

export const SensitiveData: React.FC<SensitiveDataProps> = ({
  data,
  className,
}) => {
  const [visible, setVisible] = React.useState(false);

  const maskedData = data.replace(/./g, '•');

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="font-mono">
        {visible ? data : maskedData}
      </span>
      <button
        onClick={() => setVisible(!visible)}
        className="p-1 rounded-md hover:bg-muted transition-colors"
        aria-label={visible ? 'Hide' : 'Show'}
      >
        {visible ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
};
