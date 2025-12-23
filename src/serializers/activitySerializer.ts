import type { Activity, ActivityDTO } from '@/types';
export const activitySerializer = {
  serialize: (a: Activity): ActivityDTO => ({ id: a.id, employee_id: a.employeeId, type: a.type, application: a.application, title: a.title, duration: a.duration, is_productive: a.isProductive, started_at: a.startedAt.toISOString(), ended_at: a.endedAt?.toISOString() }),
  deserialize: (dto: ActivityDTO): Activity => ({ id: dto.id, employeeId: dto.employee_id, type: dto.type, application: dto.application, title: dto.title, duration: dto.duration, isProductive: dto.is_productive, startedAt: new Date(dto.started_at), endedAt: dto.ended_at ? new Date(dto.ended_at) : undefined }),
  serializeList: (list: Activity[]): ActivityDTO[] => list.map(activitySerializer.serialize),
  deserializeList: (dtos: ActivityDTO[]): Activity[] => dtos.map(activitySerializer.deserialize),
};
