export interface SidecarContainer {
  name: string;
  port: number;
  protocol: string;
  healthEndpoint: string;
}

export interface AmbassadorConfig {
  targetService: string;
  targetPort: number;
  localPort: number;
  retries: number;
  timeout: number;
}