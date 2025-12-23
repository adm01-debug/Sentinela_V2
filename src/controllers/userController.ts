import { BaseController } from './baseController';
import { userRepository } from '@/repositories/userRepository';
class UserController extends BaseController {
  async getAll(params?: any) { const users = await userRepository.findAll(params); return this.success(users); }
  async getById(id: string) { const user = await userRepository.findById(id); if (!user) return this.error('User not found', 404); return this.success(user); }
  async create(data: any) { const user = await userRepository.create(data); return this.success(user, 'User created'); }
  async update(id: string, data: any) { const user = await userRepository.update(id, data); return this.success(user, 'User updated'); }
  async delete(id: string) { await userRepository.delete(id); return this.success(null, 'User deleted'); }
}
export const userController = new UserController();
