// Alert Banners
export { 
  AlertBanner, 
  AlertBannerStack, 
  MaintenanceBanner, 
  FeatureAnnouncement,
  type AlertBannerProps,
  type AlertBannerType,
  type AlertBannerPosition,
} from './AlertBanner';

// Notification Preferences
export { 
  NotificationPreferences,
  type NotificationPreferencesData,
  type NotificationChannel,
  type NotificationCategory,
  type NotificationSchedule,
} from './NotificationPreferences';

// Re-export existing notification components
export { NotificationCenter, NotificationPopover } from '@/components/NotificationCenter';
