export const fileConverter = {
  toBase64: (file: File): Promise<string> => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(file); }),
  fromBase64: (base64: string, filename: string, mimeType: string): File => { const arr = base64.split(','); const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n); while (n--) u8arr[n] = bstr.charCodeAt(n); return new File([u8arr], filename, { type: mimeType }); },
  toBlob: (file: File): Promise<Blob> => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(new Blob([reader.result as ArrayBuffer], { type: file.type })); reader.onerror = reject; reader.readAsArrayBuffer(file); }),
  getExtension: (filename: string): string => filename.split('.').pop()?.toLowerCase() || '',
};
