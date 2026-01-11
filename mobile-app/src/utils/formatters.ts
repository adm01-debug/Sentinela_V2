export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
