export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'pix' | 'boleto';
  createdAt: string;
}

export interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
}