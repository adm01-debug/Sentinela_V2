import { PodSecurityPolicy } from './types';

export class PSPValidator {
  validate(podSpec: PodSecurityContext, psp: PodSecurityPolicy): ValidationResult {
    const violations: string[] = [];
    
    if (podSpec.privileged && !psp.spec.privileged) violations.push('Privileged containers not allowed');
    if (podSpec.hostNetwork && !psp.spec.hostNetwork) violations.push('Host network not allowed');
    if (podSpec.hostPID && !psp.spec.hostPID) violations.push('Host PID not allowed');
    if (podSpec.hostIPC && !psp.spec.hostIPC) violations.push('Host IPC not allowed');
    
    if (psp.spec.runAsUser.rule === 'MustRunAsNonRoot' && podSpec.runAsUser === 0) {
      violations.push('Must run as non-root user');
    }
    
    if (podSpec.volumes) {
      for (const volume of podSpec.volumes) {
        if (!psp.spec.volumes.includes(volume) && !psp.spec.volumes.includes('*')) {
          violations.push('Volume type not allowed: ' + volume);
        }
      }
    }
    
    return { valid: violations.length === 0, violations };
  }
}

export interface PodSecurityContext { privileged?: boolean; hostNetwork?: boolean; hostPID?: boolean; hostIPC?: boolean; runAsUser?: number; volumes?: string[]; }
export interface ValidationResult { valid: boolean; violations: string[]; }