export interface Container { id: string; name: string; image: string; ports: PortMapping[]; env: Record<string, string>; resources: ResourceSpec; }
export interface PortMapping { containerPort: number; hostPort?: number; protocol: 'tcp' | 'udp'; }
export interface ResourceSpec { cpu: string; memory: string; }
export interface Service { name: string; replicas: number; containers: Container[]; selector: Record<string, string>; }