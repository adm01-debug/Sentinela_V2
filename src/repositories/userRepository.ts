import { BaseRepository } from './baseRepository';
import type { User } from '@/types';
class UserRepository extends BaseRepository<User> {
  constructor() { super('/users'); }
  async findByEmail(email: string) { const { data } = await this.findAll({ email }); return data[0] || null; }
  async updatePassword(id: string, password: string) { return this.update(id, { password } as any); }
  async updateAvatar(id: string, avatar: string) { return this.update(id, { avatar } as any); }
}
export const userRepository = new UserRepository();
