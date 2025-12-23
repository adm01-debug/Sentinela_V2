export const fileHandler = {
  validate: (file: File, options: { maxSize?: number; allowedTypes?: string[] }) => { if (options.maxSize && file.size > options.maxSize) throw new Error('File too large'); if (options.allowedTypes && !options.allowedTypes.includes(file.type)) throw new Error('File type not allowed'); return true; },
  getInfo: (file: File) => ({ name: file.name, size: file.size, type: file.type, lastModified: new Date(file.lastModified) }),
  rename: (file: File, newName: string): File => new File([file], newName, { type: file.type }),
  isImage: (file: File): boolean => file.type.startsWith('image/'),
  isPdf: (file: File): boolean => file.type === 'application/pdf',
};
