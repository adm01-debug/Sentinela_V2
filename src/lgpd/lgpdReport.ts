import { checkLGPDCompliance } from './lgpdRules';
import { dataSubjectRights } from './dataSubjectRights';
import { dataMappingRegistry } from './dataMapping';
export interface LGPDReport { generatedAt: Date; compliance: { passed: number; failed: number }; pendingRequests: number; dataMappings: number; }
export function generateLGPDReport(): LGPDReport { return { generatedAt: new Date(), compliance: checkLGPDCompliance(), pendingRequests: dataSubjectRights.getPending().length, dataMappings: dataMappingRegistry.getAll().length }; }
