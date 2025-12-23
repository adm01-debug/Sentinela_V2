import type { User, UserDTO } from '@/types';
export const userSerializer = {
  serialize: (user: User): UserDTO => ({ id: user.id, email: user.email, full_name: user.name, role: user.role, avatar_url: user.avatar, created_at: user.createdAt.toISOString(), updated_at: user.updatedAt?.toISOString() }),
  deserialize: (dto: UserDTO): User => ({ id: dto.id, email: dto.email, name: dto.full_name || '', role: dto.role, avatar: dto.avatar_url, createdAt: new Date(dto.created_at), updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined }),
  serializeList: (users: User[]): UserDTO[] => users.map(userSerializer.serialize),
  deserializeList: (dtos: UserDTO[]): User[] => dtos.map(userSerializer.deserialize),
};
