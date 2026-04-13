import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthPage } from '@/hooks/useAuthPage';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthBranding } from './auth/AuthBranding';
import { AuthForm } from './auth/AuthForm';

const AuthContent = React.memo(function AuthContent() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
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
      <AuthBranding />
      
      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
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

          <AuthForm
            mode={mode} email={email} password={password} name={name} company={company}
            setMode={setMode} setEmail={setEmail} setPassword={setPassword} setName={setName} setCompany={setCompany}
            handleLogin={handleLogin} handleRegister={handleRegister} handleForgot={handleForgot} handleReset={handleReset}
            isLoading={isLoading}
          />

          {/* Trust badges */}
          <div className="pt-6 mt-8 border-t border-border">
            <div className="flex items-center justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2 text-sm"><Lock className="h-4 w-4" /><span>SSL Seguro</span></div>
              <div className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4" /><span>LGPD</span></div>
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
