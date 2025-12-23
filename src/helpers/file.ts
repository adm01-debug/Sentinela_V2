export const fileHelpers = {
  toBase64: (file: File): Promise<string> => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  }),
  formatSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
    return bytes.toFixed(2) + ' ' + units[i];
  },
  getExtension: (filename: string): string => filename.split('.').pop() || '',
  getMimeType: (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', png: 'image/png', gif: 'image/gif' };
    return types[ext || ''] || 'application/octet-stream';
  },
  download: (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
};
