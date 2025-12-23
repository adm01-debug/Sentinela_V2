export interface ReportDTO { id: string; name: string; type: string; status: string; data?: string; created_at: string; created_by: string; }
export interface ReportModel { id: string; name: string; type: string; status: string; data: any; createdAt: Date; createdBy: string; }
export const reportMapper = {
  toModel: (dto: ReportDTO): ReportModel => ({ id: dto.id, name: dto.name, type: dto.type, status: dto.status, data: dto.data ? JSON.parse(dto.data) : null, createdAt: new Date(dto.created_at), createdBy: dto.created_by }),
  toDTO: (model: ReportModel): ReportDTO => ({ id: model.id, name: model.name, type: model.type, status: model.status, data: model.data ? JSON.stringify(model.data) : undefined, created_at: model.createdAt.toISOString(), created_by: model.createdBy }),
  toModelList: (dtos: ReportDTO[]): ReportModel[] => dtos.map(reportMapper.toModel),
};
