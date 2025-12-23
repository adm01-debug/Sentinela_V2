import type { Employee, EmployeeDTO } from '@/types';

export const employeeMapper = {
  toEntity: (dto: EmployeeDTO): Employee => ({
    id: dto.id,
    userId: dto.user_id,
    name: dto.name,
    email: dto.email,
    department: dto.department,
    position: dto.position,
    status: dto.status,
    teamId: dto.team_id,
    hiredAt: dto.hired_at ? new Date(dto.hired_at) : undefined,
    createdAt: new Date(dto.created_at),
  }),
  toDTO: (employee: Employee): EmployeeDTO => ({
    id: employee.id,
    user_id: employee.userId,
    name: employee.name,
    email: employee.email,
    department: employee.department,
    position: employee.position,
    status: employee.status,
    team_id: employee.teamId,
    hired_at: employee.hiredAt?.toISOString(),
    created_at: employee.createdAt.toISOString(),
  }),
  toEntityList: (dtos: EmployeeDTO[]): Employee[] => dtos.map(employeeMapper.toEntity),
};
