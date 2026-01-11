// Device types for Sentinela v17

export interface Device {
  id: string;
  employeeId: string;
  name: string;
  type: DeviceType;
  platform: DevicePlatform;
  status: DeviceStatus;
  agentVersion?: string;
  osVersion?: string;
  hostname?: string;
  macAddress?: string;
  ipAddresses: string[];
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  specs?: DeviceSpecs;
  settings: DeviceSettings;
  lastSeenAt?: string;
  lastSyncAt?: string;
  enrolledAt: string;
  isManaged: boolean;
  isCompliant: boolean;
  complianceIssues?: string[];
  createdAt: string;
  updatedAt: string;
}

export type DeviceType = 'desktop' | 'laptop' | 'mobile' | 'tablet' | 'workstation' | 'server';

export type DevicePlatform = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'chromeos';

export type DeviceStatus = 
  | 'online'
  | 'offline'
  | 'idle'
  | 'busy'
  | 'maintenance'
  | 'suspended'
  | 'retired';

export interface DeviceSpecs {
  cpu?: string;
  cpuCores?: number;
  ram?: number;
  storage?: number;
  storageType?: string;
  gpu?: string;
  screenResolution?: string;
  screenCount?: number;
}

export interface DeviceSettings {
  screenshotEnabled: boolean;
  screenshotInterval: number;
  activityTrackingEnabled: boolean;
  keyloggingEnabled: boolean;
  appTrackingEnabled: boolean;
  urlTrackingEnabled: boolean;
  idleTimeout: number;
  autoUpdate: boolean;
  stealthMode: boolean;
}

export interface DeviceActivity {
  deviceId: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: { up: number; down: number };
  activeApplication?: string;
  activeWindow?: string;
  isIdle: boolean;
}

export interface DeviceCreateInput {
  employeeId: string;
  name: string;
  type: DeviceType;
  platform: DevicePlatform;
  hostname?: string;
  macAddress?: string;
  serialNumber?: string;
  settings?: Partial<DeviceSettings>;
}

export interface DeviceUpdateInput {
  name?: string;
  status?: DeviceStatus;
  settings?: Partial<DeviceSettings>;
  isManaged?: boolean;
}

export interface DeviceFilters {
  employeeId?: string;
  type?: DeviceType;
  platform?: DevicePlatform;
  status?: DeviceStatus;
  isManaged?: boolean;
  isCompliant?: boolean;
  isOnline?: boolean;
  search?: string;
}

export interface DeviceStats {
  total: number;
  online: number;
  offline: number;
  byType: Record<DeviceType, number>;
  byPlatform: Record<DevicePlatform, number>;
  complianceRate: number;
}

export interface DeviceCommand {
  deviceId: string;
  command: 'restart' | 'shutdown' | 'lock' | 'wipe' | 'update' | 'screenshot' | 'sync';
  parameters?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high';
}
