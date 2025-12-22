import { api } from './client';

export const billingApi = {
  current: () => api.get('/billing'),
  plans: () => api.get('/billing/plans'),
  subscribe: (planId: string) => api.post('/billing/subscribe', { planId }),
  cancel: () => api.post('/billing/cancel'),
  invoices: () => api.get('/billing/invoices'),
  updatePaymentMethod: (data: any) => api.patch('/billing/payment-method', data),
  usage: () => api.get('/billing/usage'),
};
