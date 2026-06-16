// Application types for Sentinela v17

export interface Application {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  category: ApplicationCategory;
  productivityType: ProductivityType;
  icon?: string;
  publisher?: string;
  version?: string;
  description?: string;
  platforms: string[];
  executablePatterns: string[];
  urlPatterns?: string[];
  isSystem: boolean;
  isCustom: boolean;
  isActive: boolean;
  settings: ApplicationSettings;
  stats?: ApplicationStats;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationCategory =
  | "productivity"
  | "communication"
  | "development"
  | "design"
  | "entertainment"
  | "social"
  | "utilities"
  | "browser"
  | "office"
  | "finance"
  | "education"
  | "other";

export type ProductivityType = "productive" | "neutral" | "unproductive" | "custom";

export interface ApplicationSettings {
  trackTime: boolean;
  trackActivity: boolean;
  captureScreenshots: boolean;
  alertOnUsage: boolean;
  maxDailyUsage?: number;
  blockedHours?: string[];
  customProductivityScore?: number;
}

export interface ApplicationStats {
  totalUsageTime: number;
  averageDailyUsage: number;
  usersCount: number;
  lastUsedAt?: string;
}

export interface ApplicationUsage {
  applicationId: string;
  employeeId: string;
  date: string;
  totalTime: number;
  activeTime: number;
  idleTime: number;
  sessions: number;
  firstUsedAt: string;
  lastUsedAt: string;
}

export interface ApplicationCreateInput {
  name: string;
  displayName: string;
  category: ApplicationCategory;
  productivityType: ProductivityType;
  icon?: string;
  publisher?: string;
  description?: string;
  platforms?: string[];
  executablePatterns: string[];
  urlPatterns?: string[];
  settings?: Partial<ApplicationSettings>;
}

export interface ApplicationUpdateInput {
  displayName?: string;
  category?: ApplicationCategory;
  productivityType?: ProductivityType;
  icon?: string;
  description?: string;
  executablePatterns?: string[];
  urlPatterns?: string[];
  isActive?: boolean;
  settings?: Partial<ApplicationSettings>;
}

export interface ApplicationFilters {
  category?: ApplicationCategory;
  productivityType?: ProductivityType;
  platform?: string;
  isSystem?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface ApplicationRule {
  id: string;
  name: string;
  applicationIds: string[];
  action: "allow" | "block" | "alert" | "limit";
  conditions?: ApplicationCondition[];
  schedule?: RuleSchedule;
  isActive: boolean;
}

export interface ApplicationCondition {
  type: "time" | "duration" | "user" | "team" | "department";
  operator: "eq" | "ne" | "gt" | "lt" | "in";
  value: unknown;
}

export interface RuleSchedule {
  days: number[];
  startTime: string;
  endTime: string;
  timezone: string;
}
