export interface TeamDTO { id: string; name: string; description?: string; leader_id?: string; created_at: string; member_count?: number; }
export interface CreateTeamDTO { name: string; description?: string; leader_id?: string; }
export interface UpdateTeamDTO { name?: string; description?: string; leader_id?: string; }
