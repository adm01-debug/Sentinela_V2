// File utilities for Sentinela v17

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  extension: string;
  lastModified: number;
}

export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: getFileExtension(file.name),
    lastModified: file.lastModified,
  };
}

export function getFileExtension(filename): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
}

export function getFileName(path): string {
  return path.split(/\//).pop() || "";
}

export function getFileNameWithoutExtension(filename): string {
  const name = getFileName(filename);
  const lastDot = name.lastIndexOf(".");
  return lastDot > 0 ? name.substring(0, lastDot) : name;
}

export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function isImage(filename): boolean {
  const ext = getFileExtension(filename);
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext);
}

export function isVideo(filename): boolean {
  const ext = getFileExtension(filename);
  return ["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(ext);
}

export function isAudio(filename): boolean {
  const ext = getFileExtension(filename);
  return ["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(ext);
}

export function isDocument(filename): boolean {
  const ext = getFileExtension(filename);
  return ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "odt"].includes(ext);
}

export function isArchive(filename): boolean {
  const ext = getFileExtension(filename);
  return ["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext);
}

export function getMimeType(filename): string {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    mp4: "video/mp4",
    webm: "video/webm",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    json: "application/json",
    xml: "application/xml",
    txt: "text/plain",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    zip: "application/zip",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function downloadFile(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
}
