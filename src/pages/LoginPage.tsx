import { useState } from 'react';
import { useLogin } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { APP_NAME } from '@/constants';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{APP_NAME}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {login.error && <p className="text-red-500 text-sm">{(login.error as Error).message}</p>}
        <Button type="submit" className="w-full" loading={login.isPending}>Sign In</Button>
      </form>
      <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
        <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</a>
      </p>
    </div>
  );
};