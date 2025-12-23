import type { Activity, ActivityDTO } from '@/types';

export const activityMapper = {
  toEntity: (dto: ActivityDTO): Activity => ({
    id: dto.id,
    employeeId: dto.employee_id,
    type: dto.type,
    application: dto.application,
    title: dto.title,
    duration: dto.duration,
    isProductive: dto.is_productive,
    startedAt: new Date(dto.started_at),
    endedAt: dto.ended_at ? new Date(dto.ended_at) : undefined,
  }),
  toDTO: (activity: Activity): ActivityDTO => ({
    id: activity.id,
    employee_id: activity.employeeId,
    type: activity.type,
    application: activity.application,
    title: activity.title,
    duration: activity.duration,
    is_productive: activity.isProductive,
    started_at: activity.startedAt.toISOString(),
    ended_at: activity.endedAt?.toISOString(),
  }),
  toEntityList: (dtos: ActivityDTO[]): Activity[] => dtos.map(activityMapper.toEntity),
};
