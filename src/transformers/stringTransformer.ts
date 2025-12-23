export const stringTransformer = {
  capitalize: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
  titleCase: (str: string): string => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
  slugify: (str: string): string => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  truncate: (str: string, length: number, suffix = '...'): string => str.length <= length ? str : str.slice(0, length) + suffix,
  removeAccents: (str: string): string => str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  toSnakeCase: (str: string): string => str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''),
  toCamelCase: (str: string): string => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
};
