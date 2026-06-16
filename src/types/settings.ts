import type { Alert } from "./alert";

export interface Settings {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  monitoring: MonitoringSettings;
  integrations: IntegrationSettings;
}

export interface GeneralSettings {
  companyName: string;
  logo?: string;
  timezone: string;
  dateFormat: string;
  language: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: "app" | "sms" | "email";
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  ipWhitelist?: string[];
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  slack: boolean;
  slackWebhook?: string;
  alertThreshold: Alert["severity"];
}

export interface MonitoringSettings {
  screenshotEnabled: boolean;
  screenshotInterval: number;
  screenshotQuality: "low" | "medium" | "high";
  blurScreenshots: boolean;
  trackKeystrokes: boolean;
  trackMouseClicks: boolean;
  idleThreshold: number;
  excludedApplications: string[];
}

export interface IntegrationSettings {
  slack?: { enabled: boolean; token?: string };
  teams?: { enabled: boolean; webhook?: string };
  jira?: { enabled: boolean; url?: string; token?: string };
}
