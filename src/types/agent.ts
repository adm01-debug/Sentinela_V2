export interface Agent {
  id: string;
  machineId: string;
  hostname: string;
  os: string;
  version: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'idle';
  employeeId?: string;
}