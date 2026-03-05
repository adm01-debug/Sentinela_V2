// Billing Service for Sentinela v17
import { api } from './api';
import type { BillingAccount, BillingPlan, PaymentMethod, Invoice, UsageMetrics, BillingAddress } from '@/types/billing';

const BASE_URL = '/billing';

export const billingService = {
  async getAccount(): Promise<BillingAccount> {
    return api.get(`${BASE_URL}/account`);
  },

  async updateAccount(data: Partial<BillingAccount>): Promise<BillingAccount> {
    return api.put(`${BASE_URL}/account`, data);
  },

  async getPlans(): Promise<BillingPlan[]> {
    return api.get(`${BASE_URL}/plans`);
  },

  async getPlan(id: string): Promise<BillingPlan> {
    return api.get(`${BASE_URL}/plans/${id}`);
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return api.get(`${BASE_URL}/payment-methods`);
  },

  async addPaymentMethod(token: string): Promise<PaymentMethod> {
    return api.post(`${BASE_URL}/payment-methods`, { token });
  },

  async removePaymentMethod(id: string): Promise<void> {
    return api.delete(`${BASE_URL}/payment-methods/${id}`);
  },

  async setDefaultPaymentMethod(id: string): Promise<void> {
    return api.post(`${BASE_URL}/payment-methods/${id}/default`);
  },

  async getInvoices(page = 1, pageSize = 20): Promise<{ data: Invoice[]; total: number }> {
    return api.get(`${BASE_URL}/invoices?page=${page}&pageSize=${pageSize}`);
  },

  async getInvoice(id: string): Promise<Invoice> {
    return api.get(`${BASE_URL}/invoices/${id}`);
  },

  async downloadInvoice(id: string): Promise<Blob> {
    return api.get(`${BASE_URL}/invoices/${id}/download`) as Promise<Blob>;
  },

  async payInvoice(id: string, paymentMethodId?: string): Promise<Invoice> {
    return api.post(`${BASE_URL}/invoices/${id}/pay`, { paymentMethodId });
  },

  async getUsage(period?: string): Promise<UsageMetrics> {
    return api.get(`${BASE_URL}/usage${period ? `?period=${period}` : ''}`);
  },

  async updateBillingAddress(address: BillingAddress): Promise<void> {
    return api.put(`${BASE_URL}/address`, address);
  },

  async updateTaxId(taxId: string): Promise<void> {
    return api.put(`${BASE_URL}/tax-id`, { taxId });
  },

  async getPortalUrl(): Promise<{ url: string }> {
    return api.get(`${BASE_URL}/portal`);
  },

  async applyCoupon(code: string): Promise<{ discount: number; message: string }> {
    return api.post(`${BASE_URL}/coupon`, { code });
  },

  async removeCoupon(): Promise<void> {
    return api.delete(`${BASE_URL}/coupon`);
  },

  async getSubscription(): Promise<any> {
    return api.get(`${BASE_URL}/subscription`);
  },

  async subscribeToPlan(planId: string): Promise<any> {
    return api.post(`${BASE_URL}/subscribe`, { planId });
  },
};

export default billingService;
