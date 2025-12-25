/**
 * @fileoverview Jobs and CronJobs types
 * @module @sentinela/core/jobsCronJobs
 * @version 13.0.0
 */

export interface Job { name: string; namespace: string; spec: JobSpec; status?: JobStatus; }
export interface JobSpec { completions: number; parallelism: number; backoffLimit: number; template: { spec: { containers: { name: string; image: string; command?: string[] }[]; restartPolicy: 'Never' | 'OnFailure' } }; }
export interface JobStatus { active: number; succeeded: number; failed: number; startTime?: Date; completionTime?: Date; }
export interface CronJob { name: string; namespace: string; schedule: string; jobTemplate: Job; suspend: boolean; concurrencyPolicy: 'Allow' | 'Forbid' | 'Replace'; }