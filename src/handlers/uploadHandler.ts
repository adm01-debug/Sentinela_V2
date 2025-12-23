interface UploadProgress { loaded: number; total: number; percentage: number; }
export const uploadHandler = {
  upload: async (file: File, url: string, onProgress?: (p: UploadProgress) => void): Promise<any> => {
    return new Promise((resolve, reject) => { const xhr = new XMLHttpRequest(); xhr.upload.addEventListener('progress', e => { if (e.lengthComputable && onProgress) onProgress({ loaded: e.loaded, total: e.total, percentage: (e.loaded / e.total) * 100 }); }); xhr.addEventListener('load', () => { if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText)); else reject(new Error('Upload failed')); }); xhr.addEventListener('error', () => reject(new Error('Upload error'))); xhr.open('POST', url); const fd = new FormData(); fd.append('file', file); xhr.send(fd); });
  },
  uploadMultiple: async (files: File[], url: string) => Promise.all(files.map(f => uploadHandler.upload(f, url))),
};
