export function capitalize(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); }
export function capitalizeWords(value: string): string { return value.split(' ').map(capitalize).join(' '); }
export function capitalizeFirst(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1); }
