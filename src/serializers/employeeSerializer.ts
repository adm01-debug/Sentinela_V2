import type { Employee, EmployeeDTO } from '@/types';
export const employeeSerializer = {
  serialize: (e: Employee): EmployeeDTO => ({ id: e.id, user_id: e.userId, name: e.name, email: e.email, department: e.department, position: e.position, status: e.status, team_id: e.teamId, hired_at: e.hiredAt?.toISOString(), created_at: e.createdAt.toISOString() }),
  deserialize: (dto: EmployeeDTO): Employee => ({ id: dto.id, userId: dto.user_id, name: dto.name, email: dto.email, department: dto.department, position: dto.position, status: dto.status, teamId: dto.team_id, hiredAt: dto.hired_at ? new Date(dto.hired_at) : undefined, createdAt: new Date(dto.created_at) }),
  serializeList: (list: Employee[]): EmployeeDTO[] => list.map(employeeSerializer.serialize),
  deserializeList: (dtos: EmployeeDTO[]): Employee[] => dtos.map(employeeSerializer.deserialize),
};
