import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthPage } from '@/hooks/useAuthPage';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PasswordStrengthIndicator = React.memo(function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = (): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Fraca', color: 'bg-destructive' };
    if (score <= 4) return { score, label: 'Média', color: 'bg-yellow-500' };
    return { score, label: 'Forte', color: 'bg-green-500' };
  };

  const strength = getStrength();
  
  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength.score ? strength.color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Força: {strength.label}</p>
    </div>
  );
});

const AuthContent = React.memo(function AuthContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
  
  const { 
    mode, email, password, name, company, 
    setMode, setEmail, setPassword, setName, setCompany, 
    handleLogin, handleRegister, handleForgot, handleReset, 
    isLoading 
  } = useAuthPage();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Input validation
  const validateInputs = (): boolean => {
    const errors: string[] = [];
    
    // Email validation
    if (mode !== 'reset') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        errors.push('Email é obrigatório');
      } else if (!emailRegex.test(email)) {
        errors.push('Email inválido');
      } else if (email.length > 255) {
        errors.push('Email muito longo (máx. 255 caracteres)');
      }
    }
    
    // Password validation
    if (mode === 'login' || mode === 'register' || mode === 'reset') {
      if (!password) {
        errors.push('Senha é obrigatória');
      } else if (mode !== 'login') {
        if (password.length < 8) {
          errors.push('Senha deve ter no mínimo 8 caracteres');
        }
        if (!/[A-Z]/.test(password)) {
          errors.push('Senha deve conter letra maiúscula');
        }
        if (!/[a-z]/.test(password)) {
          errors.push('Senha deve conter letra minúscula');
        }
        if (!/[0-9]/.test(password)) {
          errors.push('Senha deve conter número');
        }
      }
    }
    
    // Name validation for register
    if (mode === 'register') {
      if (!name.trim()) {
        errors.push('Nome é obrigatório');
      } else if (name.length > 100) {
        errors.push('Nome muito longo (máx. 100 caracteres)');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return t('auth.login');
      case 'register': return t('auth.signup');
      case 'forgot': return t('auth.forgotPassword');
      default: return t('auth.resetPassword');
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Entre com suas credenciais';
      case 'register': return 'Crie sua conta para começar';
      case 'forgot': return 'Digite seu email para recuperar';
      default: return 'Digite sua nova senha';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'login': return t('auth.login');
      case 'register': return t('auth.signup');
      case 'forgot': return 'Enviar Email';
      default: return t('auth.resetPassword');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    switch (mode) {
      case 'login': return handleLogin();
      case 'register': return handleRegister();
      case 'forgot': return handleForgot();
      default: return handleReset();
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm">
                    {validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">{t('employees.name')}</Label>
                  <Input 
                    id="name"
                    value={name} 
                    onChange={(e) => setName(e.target.value.slice(0, 100))} 
                    placeholder={t('employees.name')}
                    autoComplete="name"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">{t('teams.name')}</Label>
                  <Input 
                    id="company"
                    value={company} 
                    onChange={(e) => setCompany(e.target.value.slice(0, 100))} 
                    placeholder={t('teams.name')}
                    autoComplete="organization"
                    maxLength={100}
                  />
                </div>
              </>
            )}
            
            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value.toLowerCase().trim().slice(0, 255))} 
                  placeholder={t('auth.email')}
                  autoComplete="email"
                  maxLength={255}
                  required
                />
              </div>
            )}
            
            {(mode === 'login' || mode === 'register' || mode === 'reset') && (
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {(mode === 'register' || mode === 'reset') && (
                  <PasswordStrengthIndicator password={password} />
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getButtonText()}
            </Button>
          </CardContent>
        </form>
        
        <CardFooter className="flex flex-col gap-2">
          {mode === 'login' && (
            <>
              <Button variant="link" onClick={() => { setMode('forgot'); setValidationErrors([]); }}>
                {t('auth.forgotPassword')}
              </Button>
              <Button variant="link" onClick={() => { setMode('register'); setValidationErrors([]); }}>
                {t('auth.noAccount')}
              </Button>
            </>
          )}
          {mode !== 'login' && (
            <Button variant="link" onClick={() => { setMode('login'); setValidationErrors([]); }}>
              {t('auth.hasAccount')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
});

export default function Auth() { 
  return <AuthContent />; 
}
