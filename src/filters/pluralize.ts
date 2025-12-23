export function pluralize(count: number, singular: string, plural?: string): string { return count === 1 ? singular : (plural || singular + 's'); }
export function pluralizeWithCount(count: number, singular: string, plural?: string): string { return count + ' ' + pluralize(count, singular, plural); }
