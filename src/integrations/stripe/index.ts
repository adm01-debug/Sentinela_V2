interface StripeConfig {
  publishableKey: string;
  secretKey?: string;
}

interface CreateCheckoutOptions {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

class StripeClient {
  private publishableKey: string;

  constructor(config?: StripeConfig) {
    this.publishableKey = config?.publishableKey || process.env.STRIPE_PUBLISHABLE_KEY || '';
  }

  async createCheckoutSession(options: CreateCheckoutOptions): Promise<{ url: string } | null> {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      return response.json();
    } catch (error) {
      console.error('Stripe checkout failed:', error);
      return null;
    }
  }

  async createPortalSession(customerId: string): Promise<{ url: string } | null> {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      return response.json();
    } catch (error) {
      console.error('Stripe portal failed:', error);
      return null;
    }
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}`);
    return response.json();
  }
}

export const stripe = new StripeClient();
