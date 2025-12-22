export const formatDate = (d: Date) => d.toLocaleDateString();
export const formatCurrency = (v: number) => `R$ ${v.toFixed(2)}`;