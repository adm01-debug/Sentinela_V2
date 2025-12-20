import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export function useAuthPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast({ title: 'Login realizado!' }); navigate('/'); },
    onError: (e: Error) => { toast({ title: 'Erro', description: e.message, variant: 'destructive' }); },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, company } } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast({ title: 'Cadastro realizado!' }); setMode('login'); },
    onError: (e: Error) => { toast({ title: 'Erro', description: e.message, variant: 'destructive' }); },
  });

  const forgotMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: 'Email enviado!' }); setMode('login'); },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: 'Senha atualizada!' }); navigate('/'); },
  });

  return {
    mode, email, password, name, company,
    setMode, setEmail, setPassword, setName, setCompany,
    handleLogin: useCallback(() => loginMutation.mutate(), [loginMutation]),
    handleRegister: useCallback(() => registerMutation.mutate(), [registerMutation]),
    handleForgot: useCallback(() => forgotMutation.mutate(), [forgotMutation]),
    handleReset: useCallback(() => resetMutation.mutate(), [resetMutation]),
    isLoading: loginMutation.isPending || registerMutation.isPending,
  };
}
