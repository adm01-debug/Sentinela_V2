export interface Settings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  display: DisplaySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  sound: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  shareActivity: boolean;
  allowScreenshots: boolean;
}

export interface DisplaySettings {
  compactMode: boolean;
  showAvatars: boolean;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}
