export interface TeamDTO { id: string; name: string; description?: string; leader_id?: string; member_count?: number; created_at?: string; }
export interface TeamModel { id: string; name: string; description: string; leaderId: string | null; memberCount: number; createdAt: Date; }
export const teamMapper = {
  toModel: (dto: TeamDTO): TeamModel => ({ id: dto.id, name: dto.name, description: dto.description || '', leaderId: dto.leader_id || null, memberCount: dto.member_count || 0, createdAt: dto.created_at ? new Date(dto.created_at) : new Date() }),
  toDTO: (model: TeamModel): TeamDTO => ({ id: model.id, name: model.name, description: model.description, leader_id: model.leaderId || undefined, member_count: model.memberCount, created_at: model.createdAt.toISOString() }),
  toModelList: (dtos: TeamDTO[]): TeamModel[] => dtos.map(teamMapper.toModel),
};
