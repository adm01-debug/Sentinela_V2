export const truncate = (str: string, len) => str.length > len ? str.slice(0, len) + '...' : str;
export const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
export const escapeHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const camelToKebab = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
export const kebabToCamel = (str: string) => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
export const pluralize = (count, singular: string, plural?: string) => count === 1 ? singular : (plural || singular + 's');
export const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
export const maskEmail = (email: string) => { const [user, domain] = email.split('@'); return user[0] + '***@' + domain; };
