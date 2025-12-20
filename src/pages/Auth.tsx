import React from 'react';
import { useAuthPage } from '@/hooks/useAuthPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2 } from 'lucide-react';

const AuthContent = React.memo(function AuthContent() {
  const { mode, email, password, name, company, setMode, setEmail, setPassword, setName, setCompany, handleLogin, handleRegister, handleForgot, handleReset, isLoading } = useAuthPage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit"><Shield className="h-8 w-8 text-primary" /></div>
          <CardTitle>{mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : mode === 'forgot' ? 'Recuperar Senha' : 'Nova Senha'}</CardTitle>
          <CardDescription>{mode === 'login' ? 'Entre com suas credenciais' : mode === 'register' ? 'Crie sua conta gratuita' : 'Informe seu email'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="space-y-2"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" /></div>
              <div className="space-y-2"><Label>Empresa</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Nome da empresa" /></div>
            </>
          )}
          {mode !== 'reset' && <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" /></div>}
          {(mode === 'login' || mode === 'register' || mode === 'reset') && <div className="space-y-2"><Label>Senha</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>}
          
          <Button className="w-full" onClick={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : mode === 'forgot' ? handleForgot : handleReset} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : mode === 'forgot' ? 'Enviar Email' : 'Atualizar Senha'}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {mode === 'login' && (
            <>
              <Button variant="link" onClick={() => setMode('forgot')}>Esqueceu a senha?</Button>
              <Button variant="link" onClick={() => setMode('register')}>Não tem conta? Cadastre-se</Button>
            </>
          )}
          {mode !== 'login' && <Button variant="link" onClick={() => setMode('login')}>Voltar para login</Button>}
        </CardFooter>
      </Card>
    </div>
  );
});

export default function Auth() { return <AuthContent />; }
