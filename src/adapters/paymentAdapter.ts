export type PaymentProvider = 'stripe' | 'paypal' | 'mercadopago';
export interface PaymentConfig { provider: PaymentProvider; publicKey: string; }
export class PaymentAdapter {
  private config: PaymentConfig;
  constructor(config: PaymentConfig) { this.config = config; }
  async createPayment(amount: number, currency: string): Promise<{ id: string; status: string }> { return { id: crypto.randomUUID(), status: 'pending' }; }
  async confirmPayment(paymentId: string): Promise<boolean> { return true; }
  async refund(paymentId: string): Promise<boolean> { return true; }
}
export const createPaymentAdapter = (config: PaymentConfig) => new PaymentAdapter(config);
