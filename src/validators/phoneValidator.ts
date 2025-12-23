export function validatePhone(phone: string): boolean { const cleaned = phone.replace(/\D/g, ''); return cleaned.length >= 10 && cleaned.length <= 11; }
export function formatPhone(phone: string): string { const cleaned = phone.replace(/\D/g, ''); if (cleaned.length === 11) return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); }
export function isMobile(phone: string): boolean { const cleaned = phone.replace(/\D/g, ''); return cleaned.length === 11 && cleaned[2] === '9'; }
