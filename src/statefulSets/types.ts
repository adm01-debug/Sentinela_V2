export interface StatefulSet { name: string; namespace: string; replicas: number; serviceName: string; selector: Record<string, string>; template: PodTemplate; volumeClaimTemplates: PVCTemplate[]; }
export interface PodTemplate { metadata: { labels: Record<string, string> }; spec: { containers: Container[] }; }
export interface Container { name: string; image: string; volumeMounts?: VolumeMount[]; }
export interface VolumeMount { name: string; mountPath: string; }
export interface PVCTemplate { metadata: { name: string }; spec: { accessModes: string[]; resources: { requests: { storage: string } } }; }