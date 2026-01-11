// Billing types for Sentinela v17

export interface BillingAccount {
  id: string;
  organizationId: string;
  status: BillingStatus;
  plan: BillingPlan;
  subscription?: Subscription;
  paymentMethod?: PaymentMethod;
  billingAddress?: BillingAddress;
  taxId?: string;
  currency: string;
  balance: number;
  creditLimit: number;
  nextBillingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type BillingStatus = 'active' | 'past_due' | 'suspended' | 'cancelled';

export interface BillingPlan {
  id: string;
  name: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: PlanFeature[];
  limits: PlanLimits;
  isActive: boolean;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  users: number;
  employees: number;
  screenshots: number;
  storage: number;
  apiCalls: number;
  integrations: number;
  retentionDays: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal' | 'invoice';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface Invoice {
  id: string;
  accountId: string;
  number: string;
  status: InvoiceStatus;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  items: InvoiceItem[];
  dueDate: string;
  paidAt?: string;
  pdfUrl?: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface UsageMetrics {
  period: { start: string; end: string };
  users: { current: number; limit: number };
  employees: { current: number; limit: number };
  screenshots: { current: number; limit: number };
  storage: { current: number; limit: number };
  apiCalls: { current: number; limit: number };
}

export interface BillingFilters {
  status?: BillingStatus;
  planTier?: string;
  startDate?: string;
  endDate?: string;
}
