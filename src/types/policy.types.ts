export interface Policy {
  id: string;
  name: string;
  description?: string;
  type: PolicyType;
  content: string;
  version: string;
  isActive: boolean;
  requiresAcknowledgment: boolean;
  teams?: string[];
  departments?: string[];
  effectiveDate: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
}
export type PolicyType =
  | "privacy"
  | "security"
  | "acceptable_use"
  | "monitoring"
  | "compliance"
  | "custom";
export interface PolicyAcknowledgment {
  id: string;
  policyId: string;
  userId: string;
  acknowledgedAt: string;
  ipAddress?: string;
  userAgent?: string;
}
export interface PolicyVersion {
  id: string;
  policyId: string;
  version: string;
  content: string;
  changedBy: string;
  changeNotes?: string;
  createdAt: string;
}
export interface PolicyStats {
  totalPolicies: number;
  activePolicies: number;
  pendingAcknowledgments: number;
  complianceRate: number;
}
