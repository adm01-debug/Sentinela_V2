export const appConfig = {
  name: "Sentinela",
  version: "18.0.0",
  description: "Employee Monitoring & Productivity Platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || "/api",
    timeout: 30000,
  },
  features: {
    screenshots: true,
    activityTracking: true,
    reports: true,
    alerts: true,
    teams: true,
    integrations: true,
  },
  limits: {
    maxUploadSize: 10 * 1024 * 1024,
    maxEmployeesPerOrg: 1000,
    maxTeamsPerOrg: 100,
    maxApiKeysPerOrg: 10,
  },
  defaults: {
    pageSize: 20,
    maxPageSize: 100,
    sessionTimeout: 24 * 60 * 60 * 1000,
  },
} as const;

export type AppConfig = typeof appConfig;
