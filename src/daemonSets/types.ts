/**
 * @fileoverview DaemonSets types
 * @module @sentinela/core/daemonSets
 * @version 13.0.0
 */

export interface DaemonSet { name: string; namespace: string; selector: Record<string, string>; template: PodTemplate; updateStrategy: UpdateStrategy; }
export interface PodTemplate { metadata: { labels: Record<string, string> }; spec: { containers: { name: string; image: string }[]; nodeSelector?: Record<string, string>; tolerations?: Toleration[] }; }
export interface UpdateStrategy { type: 'RollingUpdate' | 'OnDelete'; rollingUpdate?: { maxUnavailable: number | string }; }
export interface Toleration { key: string; operator: 'Equal' | 'Exists'; value?: string; effect?: string; }