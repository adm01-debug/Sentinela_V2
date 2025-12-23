export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Ativo',
  [UserStatus.INACTIVE]: 'Inativo',
  [UserStatus.PENDING]: 'Pendente',
  [UserStatus.SUSPENDED]: 'Suspenso',
  [UserStatus.DELETED]: 'Excluído',
};
