export function trackConversion(conversionId: string, value?: number, currency = 'BRL') {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', { send_to: conversionId, value, currency });
  }
  console.log('[Conversion]', conversionId, value);
}

export function trackPurchase(transactionId: string, value: number, items: any[]) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'purchase', { transaction_id: transactionId, value, currency: 'BRL', items });
  }
}
