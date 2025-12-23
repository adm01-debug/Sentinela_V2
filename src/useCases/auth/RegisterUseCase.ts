import { api } from '@/plugins/axios';
interface RegisterInput { name: string; email: string; password: string; }
export class RegisterUseCase {
  async execute(input: RegisterInput): Promise<any> {
    if (!input.name || !input.email || !input.password) throw new Error('All fields required');
    if (input.password.length < 8) throw new Error('Password must be at least 8 characters');
    const { data } = await api.post('/auth/register', input);
    return data;
  }
}
export const registerUseCase = new RegisterUseCase();
