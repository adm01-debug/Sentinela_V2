import { Activity, ActivityDTO } from '@/types';

export const activityMapper = {
  toEntity: (dto: ActivityDTO): Activity => ({
    id: dto.id,
    employeeId: dto.employee_id,
    type: dto.type,
    application: dto.application,
    title: dto.title,
    duration: dto.duration,
    startTime: new Date(dto.start_time),
    endTime: dto.end_time ? new Date(dto.end_time) : null,
    isProductive: dto.is_productive,
  }),
  toDTO: (entity: Activity): ActivityDTO => ({
    id: entity.id,
    employee_id: entity.employeeId,
    type: entity.type,
    application: entity.application,
    title: entity.title,
    duration: entity.duration,
    start_time: entity.startTime.toISOString(),
    end_time: entity.endTime?.toISOString() || null,
    is_productive: entity.isProductive,
  }),
  toEntityList: (dtos: ActivityDTO[]): Activity[] => dtos.map(activityMapper.toEntity),
};
