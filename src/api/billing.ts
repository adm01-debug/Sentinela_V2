import { api } from './client';

export const billingApi = {
  current: () => api.get('/billing'),
  plans: () => api.get('/billing/plans'),
  subscribe: (planId: string) => api.post('/billing/subscribe', { planId }),
  cancel: () => api.post('/billing/cancel'),
  invoices: () => api.get('/billing/invoices'),
  updatePayment: (data: Record<string, unknown>) => api.put('/billing/payment-method', data),
};