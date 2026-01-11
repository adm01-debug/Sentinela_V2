// Project types for Sentinela v17

export interface Project {
  id: string;
  name: string;
  description?: string;
  code: string;
  slug: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerId: string;
  teamId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  budget?: ProjectBudget;
  members: ProjectMember[];
  memberCount: number;
  progress: number;
  tags: string[];
  settings: ProjectSettings;
  metrics: ProjectMetrics;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  deletedAt?: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  allocation: number;
  joinedAt: string;
  isActive: boolean;
}

export type ProjectRole = 'owner' | 'manager' | 'developer' | 'designer' | 'qa' | 'viewer';

export interface ProjectBudget {
  estimated: number;
  actual: number;
  currency: string;
  hoursEstimated: number;
  hoursSpent: number;
}

export interface ProjectSettings {
  visibility: 'public' | 'private' | 'team';
  allowExternalMembers: boolean;
  requireTimeTracking: boolean;
  autoArchiveAfterDays?: number;
  notifications: ProjectNotificationSettings;
}

export interface ProjectNotificationSettings {
  statusChange: boolean;
  memberAdded: boolean;
  deadlineApproaching: boolean;
  budgetExceeded: boolean;
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  averageProductivity: number;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  code: string;
  priority?: ProjectPriority;
  teamId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  budget?: Partial<ProjectBudget>;
  tags?: string[];
  settings?: Partial<ProjectSettings>;
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  teamId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  progress?: number;
  budget?: Partial<ProjectBudget>;
  tags?: string[];
  settings?: Partial<ProjectSettings>;
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  ownerId?: string;
  teamId?: string;
  departmentId?: string;
  startAfter?: string;
  endBefore?: string;
  tags?: string[];
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  overdue: number;
  totalBudget: number;
  totalHours: number;
}
