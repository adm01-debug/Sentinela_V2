export const fileHelpers = {
  getExtension: (filename: string): string => filename.split('.').pop()?.toLowerCase() || '',
  getName: (filename: string): string => filename.replace(/\.[^.]+$/, ''),
  isImage: (filename: string): boolean => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileHelpers.getExtension(filename)),
  isPdf: (filename: string): boolean => fileHelpers.getExtension(filename) === 'pdf',
  download: (url: string, filename: string): void => { const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); },
  formatSize: (bytes: number): string => { if (bytes === 0) return '0 B'; const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; },
};
