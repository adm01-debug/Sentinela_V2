import type { Report, ReportDTO } from '@/types';
export const reportSerializer = {
  serialize: (r: Report): ReportDTO => ({ id: r.id, name: r.name, type: r.type, status: r.status, created_at: r.createdAt.toISOString(), created_by: r.createdBy, data: r.data ? JSON.stringify(r.data) : undefined }),
  deserialize: (dto: ReportDTO): Report => ({ id: dto.id, name: dto.name, type: dto.type, status: dto.status, createdAt: new Date(dto.created_at), createdBy: dto.created_by, data: dto.data ? JSON.parse(dto.data) : undefined }),
  serializeList: (list: Report[]): ReportDTO[] => list.map(reportSerializer.serialize),
  deserializeList: (dtos: ReportDTO[]): Report[] => dtos.map(reportSerializer.deserialize),
};
