import { User, UserDTO } from '@/types';

export const userMapper = {
  toEntity: (dto: UserDTO): User => ({
    id: dto.id,
    email: dto.email,
    name: dto.name || dto.full_name || '',
    role: dto.role,
    avatar: dto.avatar_url || dto.avatar,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  }),
  toDTO: (entity: User): UserDTO => ({
    id: entity.id,
    email: entity.email,
    full_name: entity.name,
    role: entity.role,
    avatar_url: entity.avatar,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  }),
  toEntityList: (dtos: UserDTO[]): User[] => dtos.map(userMapper.toEntity),
};
