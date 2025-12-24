export interface HPA { name: string; namespace: string; scaleTargetRef: ScaleTargetRef; minReplicas: number; maxReplicas: number; metrics: MetricSpec[]; }
export interface ScaleTargetRef { apiVersion: string; kind: string; name: string; }
export interface MetricSpec { type: 'Resource' | 'Pods' | 'Object' | 'External'; resource?: ResourceMetricSource; }
export interface ResourceMetricSource { name: string; target: MetricTarget; }
export interface MetricTarget { type: 'Utilization' | 'Value' | 'AverageValue'; averageUtilization?: number; value?: string; }
export interface HPAStatus { currentReplicas: number; desiredReplicas: number; currentMetrics: MetricStatus[]; }
export interface MetricStatus { type: string; resource?: { name: string; current: { averageUtilization: number } }; }