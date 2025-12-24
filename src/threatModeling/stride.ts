import { STRIDECategory, Threat } from './types';

export const STRIDEThreats: Record<STRIDECategory, { description: string; examples: string[] }> = {
  spoofing: { description: 'Pretending to be something or someone else', examples: ['Credential theft', 'Session hijacking'] },
  tampering: { description: 'Modifying data or code', examples: ['SQL injection', 'Man-in-the-middle'] },
  repudiation: { description: 'Claiming to not have performed an action', examples: ['Missing audit logs', 'Unsigned transactions'] },
  information_disclosure: { description: 'Exposing information to unauthorized parties', examples: ['Data breach', 'Error messages with sensitive info'] },
  denial_of_service: { description: 'Denying or degrading service to users', examples: ['DDoS attack', 'Resource exhaustion'] },
  elevation_of_privilege: { description: 'Gaining capabilities without authorization', examples: ['Privilege escalation', 'Authorization bypass'] }
};

export class STRIDEAnalyzer {
  analyze(assetType: string): STRIDECategory[] {
    const applicable: STRIDECategory[] = [];
    if (assetType === 'data') applicable.push('tampering', 'information_disclosure');
    if (assetType === 'process') applicable.push('spoofing', 'tampering', 'denial_of_service', 'elevation_of_privilege');
    if (assetType === 'external') applicable.push('spoofing', 'repudiation');
    return applicable;
  }
}