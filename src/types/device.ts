export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'mobile' | 'tablet';
  os: string;
  osVersion: string;
  agentVersion: string;
  status: 'online' | 'offline' | 'idle';
  lastSeen: string;
  employeeId?: string;
  ipAddress?: string;
  macAddress?: string;
}

export interface DeviceStats {
  total: number;
  online: number;
  offline: number;
  byType: Record<Device['type'], number>;
}

export interface DeviceFilter {
  status?: Device['status'];
  type?: Device['type'];
  employeeId?: string;
}
