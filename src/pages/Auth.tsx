import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthPage } from '@/hooks/useAuthPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2 } from 'lucide-react';

const AuthContent = React.memo(function AuthContent() {
  const { t } = useTranslation();
  const { 
    mode, email, password, name, company, 
    setMode, setEmail, setPassword, setName, setCompany, 
    handleLogin, handleRegister, handleForgot, handleReset, 
    isLoading 
  } = useAuthPage();

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
      case 'login': return t('auth.loginSuccess');
      case 'register': return t('auth.signupSuccess');
      default: return t('auth.email');
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'login': return t('auth.login');
      case 'register': return t('auth.signup');
      case 'forgot': return t('common.save');
      default: return t('auth.resetPassword');
    }
  };

  const handleSubmit = () => {
    switch (mode) {
      case 'login': return handleLogin();
      case 'register': return handleRegister();
      case 'forgot': return handleForgot();
      default: return handleReset();
    }
  };

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
        <CardContent className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label>{t('employees.name')}</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder={t('employees.name')} 
                />
              </div>
              <div className="space-y-2">
                <Label>{t('teams.name')}</Label>
                <Input 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)} 
                  placeholder={t('teams.name')} 
                />
              </div>
            </>
          )}
          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label>{t('auth.email')}</Label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder={t('auth.email')} 
              />
            </div>
          )}
          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div className="space-y-2">
              <Label>{t('auth.password')}</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
              />
            </div>
          )}
          
          <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getButtonText()}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {mode === 'login' && (
            <>
              <Button variant="link" onClick={() => setMode('forgot')}>
                {t('auth.forgotPassword')}
              </Button>
              <Button variant="link" onClick={() => setMode('register')}>
                {t('auth.noAccount')}
              </Button>
            </>
          )}
          {mode !== 'login' && (
            <Button variant="link" onClick={() => setMode('login')}>
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
