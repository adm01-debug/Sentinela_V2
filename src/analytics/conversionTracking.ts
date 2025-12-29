declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

interface ConversionParams {
  send_to: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
}

interface PurchaseItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface PurchaseParams {
  transaction_id: string;
  value: number;
  currency: string;
  items: PurchaseItem[];
}

export function trackConversion(conversionId: string, value?: number): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const params: ConversionParams = { send_to: conversionId };
  if (value !== undefined) {
    params.value = value;
    params.currency = 'BRL';
  }
  
  window.gtag('event', 'conversion', params);
}

export function trackPurchase(
  transactionId: string,
  value: number,
  items: PurchaseItem[],
  currency = 'BRL'
): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const params: PurchaseParams = {
    transaction_id: transactionId,
    value,
    currency,
    items,
  };
  
  window.gtag('event', 'purchase', params);
}

export function trackSignUp(method: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'sign_up', { method });
}

export function trackLogin(method: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'login', { method });
}

export type { ConversionParams, PurchaseItem, PurchaseParams };
