// Subscription Service for Sentinela v17
import { api } from './api';
import type { Subscription, SubscriptionCreateInput, SubscriptionUpdateInput, SubscriptionStats, SubscriptionChange, PlanComparison } from '@/types/subscription';

const BASE_URL = '/subscriptions';

export const subscriptionService = {
  async getCurrent(): Promise<Subscription> {
    return api.get(`${BASE_URL}/current`);
  },

  async create(data: SubscriptionCreateInput): Promise<Subscription> {
    return api.post(BASE_URL, data);
  },

  async update(data: SubscriptionUpdateInput): Promise<Subscription> {
    return api.put(`${BASE_URL}/current`, data);
  },

  async cancel(reason?: string, cancelImmediately = false): Promise<Subscription> {
    return api.post(`${BASE_URL}/current/cancel`, { reason, cancelImmediately });
  },

  async reactivate(): Promise<Subscription> {
    return api.post(`${BASE_URL}/current/reactivate`);
  },

  async pause(resumeAt?: string): Promise<Subscription> {
    return api.post(`${BASE_URL}/current/pause`, { resumeAt });
  },

  async resume(): Promise<Subscription> {
    return api.post(`${BASE_URL}/current/resume`);
  },

  async changePlan(planId: string, prorate = true): Promise<Subscription> {
    return api.post(`${BASE_URL}/current/change-plan`, { planId, prorate });
  },

  async previewChange(planId: string): Promise<PlanComparison> {
    return api.get(`${BASE_URL}/current/preview-change?planId=${planId}`);
  },

  async updateQuantity(quantity: number): Promise<Subscription> {
    return api.put(`${BASE_URL}/current/quantity`, { quantity });
  },

  async getHistory(): Promise<SubscriptionChange[]> {
    return api.get(`${BASE_URL}/current/history`);
  },

  async getStats(): Promise<SubscriptionStats> {
    return api.get(`${BASE_URL}/stats`);
  },

  async startTrial(planId: string, trialDays?: number): Promise<Subscription> {
    return api.post(`${BASE_URL}/trial`, { planId, trialDays });
  },

  async extendTrial(days: number): Promise<Subscription> {
    return api.post(`${BASE_URL}/current/extend-trial`, { days });
  },

  async applyCoupon(code: string): Promise<Subscription> {
    return api.post(`${BASE_URL}/current/coupon`, { code });
  },

  async removeCoupon(): Promise<Subscription> {
    return api.delete(`${BASE_URL}/current/coupon`);
  },

  async getUpcomingInvoice(): Promise<unknown> {
    return api.get(`${BASE_URL}/current/upcoming-invoice`);
  },

  async updatePaymentMethod(paymentMethodId: string): Promise<Subscription> {
    return api.put(`${BASE_URL}/current/payment-method`, { paymentMethodId });
  },
};

export default subscriptionService;
