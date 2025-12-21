export interface MonitoringConfig {
  id: string;
  employeeId: string;
  screenshotInterval: number;
  keystrokeLogging: boolean;
  urlTracking: boolean;
  applicationTracking: boolean;
  idleTimeout: number;
  blurSensitiveData: boolean;
}

export interface MonitoringSession {
  id: string;
  employeeId: string;
  deviceId: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
  activeTime: number;
  idleTime: number;
}

export interface MonitoringStats {
  activeSessions: number;
  totalScreenshots: number;
  keystrokesToday: number;
  topApplications: { name: string; duration: number }[];
  productivityScore: number;
}

export interface ScreenshotCapture {
  id: string;
  sessionId: string;
  timestamp: string;
  url?: string;
  application?: string;
  blurred: boolean;
}
