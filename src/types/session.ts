// Session types for Sentinela v17

export interface Session {
  id: string;
  userId: string;
  deviceId?: string;
  token: string;
  refreshToken?: string;
  type: SessionType;
  status: SessionStatus;
  ipAddress: string;
  userAgent: string;
  device?: DeviceInfo;
  location?: SessionLocation;
  permissions: string[];
  expiresAt: string;
  lastActiveAt: string;
  createdAt: string;
  revokedAt?: string;
  revokedReason?: string;
}

export type SessionType = "web" | "mobile" | "desktop" | "api" | "oauth";

export type SessionStatus = "active" | "expired" | "revoked" | "locked";

export interface DeviceInfo {
  type: "desktop" | "mobile" | "tablet" | "unknown";
  os: string;
  osVersion?: string;
  browser?: string;
  browserVersion?: string;
  deviceName?: string;
  isTrusted: boolean;
}

export interface SessionLocation {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface SessionActivity {
  sessionId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: unknown;
  timestamp: string;
}

export interface ActiveSession {
  session: Session;
  isCurrent: boolean;
  lastActivity?: SessionActivity;
}

export interface SessionCreateInput {
  userId: string;
  type: SessionType;
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  expiresIn?: number;
  permissions?: string[];
}

export interface SessionFilters {
  userId?: string;
  type?: SessionType;
  status?: SessionStatus;
  ipAddress?: string;
  deviceId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SessionStats {
  total: number;
  active: number;
  byType: Record<SessionType, number>;
  byDevice: Record<string, number>;
  byCountry: Record<string, number>;
}

export interface SessionRevoke {
  sessionId?: string;
  userId?: string;
  revokeAll?: boolean;
  exceptCurrent?: boolean;
  reason?: string;
}

export interface SessionSecurity {
  userId: string;
  maxConcurrentSessions: number;
  sessionTimeout: number;
  requireReauthAfter?: number;
  trustedDevicesOnly: boolean;
  allowedIpRanges?: string[];
}
