import { Employee, EmployeeDTO } from '@/types';

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
    startDate: new Date(dto.start_date),
  }),
  toDTO: (entity: Employee): EmployeeDTO => ({
    id: entity.id,
    user_id: entity.userId,
    name: entity.name,
    email: entity.email,
    department: entity.department,
    position: entity.position,
    status: entity.status,
    team_id: entity.teamId,
    start_date: entity.startDate.toISOString(),
  }),
  toEntityList: (dtos: EmployeeDTO[]): Employee[] => dtos.map(employeeMapper.toEntity),
};
