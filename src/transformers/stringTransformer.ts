export const stringTransformer = {
  capitalize: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
  titleCase: (str: string): string => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
  slug: (str: string): string => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  truncate: (str: string, len: number, suffix = '...'): string => str.length > len ? str.slice(0, len) + suffix : str,
  removeAccents: (str: string): string => str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  mask: (str: string, start = 0, end = str.length, char = '*'): string => str.slice(0, start) + char.repeat(end - start) + str.slice(end),
};
