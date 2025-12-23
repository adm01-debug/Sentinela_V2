import { api } from '@/plugins/axios';
interface LoginInput { email: string; password: string; }
interface LoginOutput { token: string; user: any; }
export class LoginUseCase {
  async execute(input: LoginInput): Promise<LoginOutput> {
    if (!input.email || !input.password) throw new Error('Email and password required');
    const { data } = await api.post('/auth/login', input);
    localStorage.setItem('auth_token', data.token);
    return data;
  }
}
export const loginUseCase = new LoginUseCase();
