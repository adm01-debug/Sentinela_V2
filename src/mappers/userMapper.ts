import type { User, UserDTO } from '@/types';

export const userMapper = {
  toEntity: (dto: UserDTO): User => ({
    id: dto.id,
    email: dto.email,
    name: dto.name || dto.full_name || '',
    role: dto.role,
    avatar: dto.avatar_url || dto.avatar,
    createdAt: new Date(dto.created_at),
    updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
  }),
  toDTO: (user: User): UserDTO => ({
    id: user.id,
    email: user.email,
    full_name: user.name,
    role: user.role,
    avatar_url: user.avatar,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt?.toISOString(),
  }),
  toEntityList: (dtos: UserDTO[]): User[] => dtos.map(userMapper.toEntity),
};
