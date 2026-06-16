export type ApplicationCategory = "productive" | "neutral" | "unproductive";

export interface ApplicationUsage {
  id: string;
  name: string;
  icon: string; // emoji
  category: ApplicationCategory;
  duration: number; // minutes
  lastUsed: string;
}

export interface TimelineActivity {
  id: string;
  timestamp: string;
  application: string;
  title: string;
  duration: number; // seconds
}

export const defaultApplications: ApplicationUsage[] = [
  {
    id: "app1",
    name: "Chrome",
    icon: "🌐",
    category: "productive",
    duration: 95,
    lastUsed: "há 3 min",
  },
  {
    id: "app2",
    name: "YouTube",
    icon: "▶️",
    category: "unproductive",
    duration: 22,
    lastUsed: "há 1 h",
  },
];

export const defaultActivities: TimelineActivity[] = [
  {
    id: "t1",
    timestamp: new Date().toISOString(),
    application: "Chrome",
    title: "Acessou portal interno",
    duration: 180,
  },
];

export const employeeApplications: Record<string, ApplicationUsage[]> = {};
export const employeeActivities: Record<string, TimelineActivity[]> = {};
