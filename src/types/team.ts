// Team types for Sentinela v17

export interface Team {
  id: string;
  name: string;
  description?: string;
  slug: string;
  leaderId?: string;
  leader?: TeamMember;
  departmentId?: string;
  parentTeamId?: string;
  parentTeam?: Team;
  childTeams?: Team[];
  members: TeamMember[];
  memberCount: number;
  isActive: boolean;
  settings: TeamSettings;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: string;
  isActive: boolean;
}

export type TeamRole = 'leader' | 'manager' | 'member' | 'viewer';

export interface TeamSettings {
  allowSelfJoin: boolean;
  requireApproval: boolean;
  maxMembers?: number;
  defaultRole: TeamRole;
  visibility: 'public' | 'private' | 'hidden';
  notifications: TeamNotificationSettings;
}

export interface TeamNotificationSettings {
  newMember: boolean;
  memberLeft: boolean;
  alerts: boolean;
  reports: boolean;
}

export interface TeamCreateInput {
  name: string;
  description?: string;
  leaderId?: string;
  departmentId?: string;
  parentTeamId?: string;
  settings?: Partial<TeamSettings>;
}

export interface TeamUpdateInput {
  name?: string;
  description?: string;
  leaderId?: string;
  departmentId?: string;
  parentTeamId?: string;
  isActive?: boolean;
  settings?: Partial<TeamSettings>;
}

export interface TeamFilters {
  search?: string;
  departmentId?: string;
  leaderId?: string;
  isActive?: boolean;
  hasMembers?: boolean;
}

export interface TeamStats {
  total: number;
  active: number;
  totalMembers: number;
  averageSize: number;
}

export interface AddMemberInput {
  userId: string;
  role?: TeamRole;
}

export interface UpdateMemberInput {
  role?: TeamRole;
  isActive?: boolean;
}
