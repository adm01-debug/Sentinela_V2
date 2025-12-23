export interface SettingsDTO { id: string; user_id: string; theme: string; language: string; notifications_enabled: boolean; email_notifications: boolean; }
export interface SettingsModel { id: string; userId: string; theme: string; language: string; notificationsEnabled: boolean; emailNotifications: boolean; }
export const settingsMapper = {
  toModel: (dto: SettingsDTO): SettingsModel => ({ id: dto.id, userId: dto.user_id, theme: dto.theme, language: dto.language, notificationsEnabled: dto.notifications_enabled, emailNotifications: dto.email_notifications }),
  toDTO: (model: SettingsModel): SettingsDTO => ({ id: model.id, user_id: model.userId, theme: model.theme, language: model.language, notifications_enabled: model.notificationsEnabled, email_notifications: model.emailNotifications }),
};
