export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId?: string;
  memberIds: string[];
  parentTeamId?: string;
  createdAt: string;
  updatedAt: string;
  settings?: TeamSettings;
}

export interface TeamSettings {
  defaultPolicies: string[];
  workScheduleId?: string;
  monitoringLevel: 'minimal' | 'standard' | 'detailed';
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  averageProductivity: number;
  violations: number;
}

export interface TeamMember {
  userId: string;
  role: 'member' | 'lead' | 'admin';
  joinedAt: string;
}
