export const truncate = (str: string, len: number) => str.length > len ? str.slice(0, len) + '...' : str;
export const stripHtml = (html) => html.replace(/<[^>]*>/g, '');
export const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const camelToKebab = (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
export const kebabToCamel = (str) => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
export const pluralize = (count: number, singular: string, plural?: string) => count === 1 ? singular : (plural || singular + 's');
export const initials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
export const maskEmail = (email) => { const [user, domain] = email.split('@'); return user[0] + '***@' + domain; };
