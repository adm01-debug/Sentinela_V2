export enum ActivityType {
  APP = 'app',
  WEBSITE = 'website',
  IDLE = 'idle',
  MEETING = 'meeting',
  BREAK = 'break',
  OFFLINE = 'offline',
}

export const ActivityTypeLabels: Record<ActivityType, string> = {
  [ActivityType.APP]: 'Aplicativo',
  [ActivityType.WEBSITE]: 'Website',
  [ActivityType.IDLE]: 'Ocioso',
  [ActivityType.MEETING]: 'Reunião',
  [ActivityType.BREAK]: 'Pausa',
  [ActivityType.OFFLINE]: 'Offline',
};
