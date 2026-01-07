import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthPage } from '@/hooks/useAuthPage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, Eye, EyeOff, AlertTriangle, Lock, Mail, User, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrengthChecker } from '@/components/auth/PasswordStrengthChecker';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  { icon: Shield, title: 'Monitoramento 24/7', description: 'Proteção contínua para sua equipe' },
  { icon: Lock, title: 'Segurança Avançada', description: 'Criptografia de ponta a ponta' },
  { icon: CheckCircle2, title: 'Conformidade LGPD', description: 'Dados protegidos por lei' },
];

const AuthContent = React.memo(function AuthContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
  const [passwordIsValid, setPasswordIsValid] = React.useState(false);
  const [passwordIsLeaked, setPasswordIsLeaked] = React.useState(false);
  
  const { 
    mode, email, password, name, company, 
    setMode, setEmail, setPassword, setName, setCompany, 
    handleLogin, handleRegister, handleForgot, handleReset, 
    isLoading 
  } = useAuthPage();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const validateInputs = (): boolean => {
    const errors: string[] = [];
    
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
    
    if (mode === 'login' || mode === 'register' || mode === 'reset') {
      if (!password) {
        errors.push('Senha é obrigatória');
      } else if (mode !== 'login') {
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

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Bem-vindo de volta';
      case 'register': return 'Crie sua conta';
      case 'forgot': return 'Recuperar senha';
      default: return 'Nova senha';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Entre para acessar seu painel de controle';
      case 'register': return 'Comece a monitorar sua equipe em minutos';
      case 'forgot': return 'Enviaremos um link para seu email';
      default: return 'Defina sua nova senha segura';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'login': return 'Entrar';
      case 'register': return 'Criar conta';
      case 'forgot': return 'Enviar link';
      default: return 'Redefinir senha';
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <Shield className="h-12 w-12 text-primary relative z-10" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Background with gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        
        {/* Animated orbs */}
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-10" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Sentinela</h1>
              <p className="text-white/60 text-sm">Monitoramento Inteligente</p>
            </div>
          </motion.div>
          
          {/* Main headline */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Monitore sua equipe com
              <span className="block text-white/90">inteligência e segurança</span>
            </h2>
            <p className="text-lg text-white/70 max-w-md">
              Aumente a produtividade e mantenha a conformidade com nossa plataforma completa de monitoramento corporativo.
            </p>
          </motion.div>
          
          {/* Features */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="p-2 rounded-lg bg-white/10">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Sentinela</h1>
              <p className="text-muted-foreground text-sm">Monitoramento Inteligente</p>
            </div>
          </div>
          
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
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{getTitle()}</h2>
                <p className="mt-2 text-muted-foreground">{getDescription()}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {validationErrors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {validationErrors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {mode === 'register' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Nome completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="name"
                          value={name} 
                          onChange={(e) => setName(e.target.value.slice(0, 100))} 
                          placeholder="Seu nome"
                          autoComplete="name"
                          maxLength={100}
                          className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-medium">Empresa</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="company"
                          value={company} 
                          onChange={(e) => setCompany(e.target.value.slice(0, 100))} 
                          placeholder="Nome da empresa"
                          autoComplete="organization"
                          maxLength={100}
                          className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {mode !== 'reset' && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email"
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value.toLowerCase().trim().slice(0, 255))} 
                        placeholder="seu@email.com"
                        autoComplete="email"
                        maxLength={255}
                        required
                        className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
                      />
                    </div>
                  </div>
                )}
                
                {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); setValidationErrors([]); }}
                          className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          Esqueceu a senha?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••"
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        className="pl-10 pr-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {(mode === 'register' || mode === 'reset') && (
                      <PasswordStrengthChecker 
                        password={password}
                        checkLeaked={true}
                        onStrengthChange={(isValid) => setPasswordIsValid(isValid)}
                        onLeakedCheck={(isLeaked) => setPasswordIsLeaked(isLeaked)}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-opacity group"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {getButtonText()}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
          
          {/* Footer links */}
          <div className="text-center space-y-3">
            {mode === 'login' && (
              <p className="text-muted-foreground">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setValidationErrors([]); }}
                  className="text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Criar conta grátis
                </button>
              </p>
            )}
            {mode !== 'login' && (
              <p className="text-muted-foreground">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setValidationErrors([]); }}
                  className="text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Entrar
                </button>
              </p>
            )}
          </div>
          
          {/* Trust badges */}
          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4" />
                <span>SSL Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" />
                <span>LGPD</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

export default function Auth() { 
  return <AuthContent />; 
}
