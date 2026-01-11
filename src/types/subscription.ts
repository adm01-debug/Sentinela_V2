// Subscription types for Sentinela v17
import { BillingPlan, PaymentMethod } from './billing';

export interface Subscription {
  id: string;
  accountId: string;
  planId: string;
  plan: BillingPlan;
  status: SubscriptionStatus;
  currentPeriod: SubscriptionPeriod;
  trialEnd?: string;
  cancelAt?: string;
  cancelledAt?: string;
  pausedAt?: string;
  resumeAt?: string;
  quantity: number;
  discount?: SubscriptionDiscount;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'cancelled'
  | 'expired'
  | 'incomplete';

export interface SubscriptionPeriod {
  start: string;
  end: string;
  billingCycle: 'monthly' | 'yearly';
}

export interface SubscriptionDiscount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  validUntil?: string;
  maxRedemptions?: number;
  timesRedeemed: number;
}

export interface SubscriptionChange {
  id: string;
  subscriptionId: string;
  type: ChangeType;
  fromPlanId?: string;
  toPlanId?: string;
  effectiveDate: string;
  prorationAmount?: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export type ChangeType = 'upgrade' | 'downgrade' | 'cancel' | 'pause' | 'resume' | 'renew';

export interface SubscriptionCreateInput {
  planId: string;
  paymentMethodId?: string;
  quantity?: number;
  couponCode?: string;
  trialDays?: number;
}

export interface SubscriptionUpdateInput {
  planId?: string;
  quantity?: number;
  couponCode?: string;
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  planId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  trialing: number;
  cancelled: number;
  mrr: number;
  arr: number;
  churnRate: number;
}

export interface PlanComparison {
  currentPlan: BillingPlan;
  newPlan: BillingPlan;
  priceDifference: number;
  prorationAmount: number;
  effectiveDate: string;
  featureChanges: FeatureChange[];
}

export interface FeatureChange {
  feature: string;
  current: boolean | number;
  new: boolean | number;
  type: 'added' | 'removed' | 'upgraded' | 'downgraded';
}
