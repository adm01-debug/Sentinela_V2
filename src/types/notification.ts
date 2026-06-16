// Notification types for Sentinela v17

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  data?: unknown;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;
  readAt?: string;
  dismissedAt?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | "alert"
  | "warning"
  | "info"
  | "success"
  | "error"
  | "system"
  | "task"
  | "mention"
  | "reminder";

export type NotificationCategory =
  | "security"
  | "productivity"
  | "compliance"
  | "system"
  | "team"
  | "report"
  | "billing"
  | "account";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export type NotificationChannel = "in_app" | "email" | "push" | "sms" | "slack" | "webhook";

export type NotificationStatus = "pending" | "sent" | "delivered" | "read" | "dismissed" | "failed";

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  titleTemplate: string;
  messageTemplate: string;
  defaultChannels: NotificationChannel[];
  defaultPriority: NotificationPriority;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  userId: string;
  globalEnabled: boolean;
  channels: ChannelPreferences;
  categories: CategoryPreferences;
  quietHours: QuietHoursSettings;
  frequency: FrequencySettings;
}

export interface ChannelPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  slack: boolean;
  inApp: boolean;
}

export interface CategoryPreferences {
  security: boolean;
  productivity: boolean;
  compliance: boolean;
  system: boolean;
  team: boolean;
  report: boolean;
  billing: boolean;
}

export interface QuietHoursSettings {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
  allowUrgent: boolean;
}

export interface FrequencySettings {
  digestEnabled: boolean;
  digestFrequency: "daily" | "weekly";
  digestTime: string;
  batchSimilar: boolean;
  maxPerHour: number;
}

export interface NotificationFilters {
  userId?: string;
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
}

export interface SendNotificationInput {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  data?: unknown;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
}

export interface BulkNotificationInput {
  userIds: string[];
  notification: Omit<SendNotificationInput, "userId">;
}
