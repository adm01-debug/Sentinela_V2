export interface ViolationDTO { id: string; employee_id: string; type: string; severity: string; status: string; description?: string; detected_at: string; }
export interface ViolationModel { id: string; employeeId: string; type: string; severity: string; status: string; description: string; detectedAt: Date; }
export const violationMapper = {
  toModel: (dto: ViolationDTO): ViolationModel => ({ id: dto.id, employeeId: dto.employee_id, type: dto.type, severity: dto.severity, status: dto.status, description: dto.description || '', detectedAt: new Date(dto.detected_at) }),
  toDTO: (model: ViolationModel): ViolationDTO => ({ id: model.id, employee_id: model.employeeId, type: model.type, severity: model.severity, status: model.status, description: model.description, detected_at: model.detectedAt.toISOString() }),
  toModelList: (dtos: ViolationDTO[]): ViolationModel[] => dtos.map(violationMapper.toModel),
};
