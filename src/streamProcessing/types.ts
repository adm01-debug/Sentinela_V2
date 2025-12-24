export interface StreamConfig {
  name: string;
  parallelism: number;
  checkpointInterval: number;
}

export interface StreamRecord<T> {
  key: string;
  value: T;
  timestamp: Date;
  partition: number;
}

export interface WindowConfig {
  type: 'tumbling' | 'sliding' | 'session';
  size: number;
  slide?: number;
  gap?: number;
}