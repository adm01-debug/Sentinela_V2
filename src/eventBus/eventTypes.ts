export const EventTypes = { APP_INITIALIZED: 'app:initialized', APP_ERROR: 'app:error', USER_LOGIN: 'user:login', USER_LOGOUT: 'user:logout', DATA_LOADED: 'data:loaded', DATA_SAVED: 'data:saved', NAVIGATION: 'navigation', NOTIFICATION: 'notification', THEME_CHANGED: 'theme:changed', LANGUAGE_CHANGED: 'language:changed', } as const;
export type EventType = typeof EventTypes[keyof typeof EventTypes];
export interface AppEvent<T = any> { type: EventType; payload: T; timestamp: number; }
