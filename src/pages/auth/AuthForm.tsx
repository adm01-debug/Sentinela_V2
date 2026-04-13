import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, AlertTriangle, Lock, Mail, User, Building2, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrengthChecker } from '@/components/auth/PasswordStrengthChecker';
import { motion, AnimatePresence } from 'framer-motion';
import { lovable } from '@/integrations/lovable/index';

interface AuthFormProps {
  mode: 'login' | 'register' | 'forgot' | 'reset';
  email: string;
  password: string;
  name: string;
  company: string;
  setMode: (mode: 'login' | 'register' | 'forgot' | 'reset') => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setName: (v: string) => void;
  setCompany: (v: string) => void;
  handleLogin: () => void;
  handleRegister: () => void;
  handleForgot: () => void;
  handleReset: () => void;
  isLoading: boolean;
}

const getTitle = (mode: string) => {
  switch (mode) {
    case 'login': return 'Bem-vindo de volta';
    case 'register': return 'Crie sua conta';
    case 'forgot': return 'Recuperar senha';
    default: return 'Nova senha';
  }
};

const getDescription = (mode: string) => {
  switch (mode) {
    case 'login': return 'Entre para acessar seu painel de controle';
    case 'register': return 'Comece a monitorar sua equipe em minutos';
    case 'forgot': return 'Enviaremos um link para seu email';
    default: return 'Defina sua nova senha segura';
  }
};

const getButtonText = (mode: string) => {
  switch (mode) {
    case 'login': return 'Entrar';
    case 'register': return 'Criar conta';
    case 'forgot': return 'Enviar link';
    default: return 'Redefinir senha';
  }
};

export function AuthForm({
  mode, email, password, name, company,
  setMode, setEmail, setPassword, setName, setCompany,
  handleLogin, handleRegister, handleForgot, handleReset,
  isLoading,
}: AuthFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
  const [passwordIsValid, setPasswordIsValid] = React.useState(false);
  const [passwordIsLeaked, setPasswordIsLeaked] = React.useState(false);

  const validateInputs = (): boolean => {
    const errors: string[] = [];
    
    if (mode !== 'reset') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) errors.push('Email é obrigatório');
      else if (!emailRegex.test(email)) errors.push('Email inválido');
      else if (email.length > 255) errors.push('Email muito longo (máx. 255 caracteres)');
    }
    
    if (mode === 'login' || mode === 'register' || mode === 'reset') {
      if (!password) errors.push('Senha é obrigatória');
      else if (mode !== 'login') {
        if (password.length < 8) errors.push('Senha deve ter no mínimo 8 caracteres');
        if (!/[A-Z]/.test(password)) errors.push('Senha deve conter letra maiúscula');
        if (!/[a-z]/.test(password)) errors.push('Senha deve conter letra minúscula');
        if (!/[0-9]/.test(password)) errors.push('Senha deve conter número');
        if (!/[^a-zA-Z0-9]/.test(password)) errors.push('Senha deve conter caractere especial');
        if (passwordIsLeaked) errors.push('Esta senha foi encontrada em vazamentos de dados');
      }
    }
    
    if (mode === 'register') {
      if (!name.trim()) errors.push('Nome é obrigatório');
      else if (name.length > 100) errors.push('Nome muito longo (máx. 100 caracteres)');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
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

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{getTitle(mode)}</h2>
            <p className="mt-2 text-muted-foreground">{getDescription(mode)}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {validationErrors.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {validationErrors.map((error, i) => <li key={i}>{error}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value.slice(0, 100))} placeholder="Seu nome" autoComplete="name" maxLength={100} className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">Empresa</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value.slice(0, 100))} placeholder="Nome da empresa" autoComplete="organization" maxLength={100} className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary" />
                </div>
              </div>
            </>
          )}
          
          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase().trim().slice(0, 255))} placeholder="seu@email.com" autoComplete="email" maxLength={255} required className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary" />
              </div>
            </div>
          )}
          
          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                {mode === 'login' && (
                  <button type="button" onClick={() => { setMode('forgot'); setValidationErrors([]); }} className="text-sm text-primary hover:text-primary/80 transition-colors">
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="pl-10 pr-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary" required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {(mode === 'register' || mode === 'reset') && (
                <PasswordStrengthChecker password={password} checkLeaked={true} onStrengthChange={(isValid) => setPasswordIsValid(isValid)} onLeakedCheck={(isLeaked) => setPasswordIsLeaked(isLeaked)} />
              )}
            </div>
          )}
        </motion.div>
        
        <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{getButtonText(mode)}<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
        </Button>

        {(mode === 'login' || mode === 'register') && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted-foreground/20" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">ou continue com</span></div>
            </div>
            <Button type="button" variant="outline" className="w-full h-12 text-base font-medium border-muted-foreground/20 hover:bg-muted/50"
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
                if (error) console.error('OAuth error:', error);
              }}>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </Button>
          </>
        )}
      </form>
      
      {/* Mode switchers */}
      <div className="text-center text-sm">
        {mode === 'login' && (
          <p className="text-muted-foreground">
            Não tem conta?{' '}
            <button onClick={() => { setMode('register'); setValidationErrors([]); }} className="text-primary font-medium hover:underline">Criar conta</button>
          </p>
        )}
        {mode === 'register' && (
          <p className="text-muted-foreground">
            Já tem conta?{' '}
            <button onClick={() => { setMode('login'); setValidationErrors([]); }} className="text-primary font-medium hover:underline">Entrar</button>
          </p>
        )}
        {(mode === 'forgot' || mode === 'reset') && (
          <p className="text-muted-foreground">
            Lembrou a senha?{' '}
            <button onClick={() => { setMode('login'); setValidationErrors([]); }} className="text-primary font-medium hover:underline">Voltar ao login</button>
          </p>
        )}
      </div>
    </div>
  );
}
