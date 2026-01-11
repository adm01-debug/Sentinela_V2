// Storage Service for Sentinela v17
import { api } from './api';
import type { Attachment, AttachmentFilters, AttachmentStats, UploadProgress } from '@/types/attachment';

const BASE_URL = '/storage';

export const storageService = {
  async upload(file: File, options?: { folder?: string; isPublic?: boolean; onProgress?: (progress: number) => void }): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.isPublic !== undefined) formData.append('isPublic', String(options.isPublic));
    
    return api.post(`${BASE_URL}/upload`, formData, {
      onUploadProgress: (e) => options?.onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
    });
  },

  async uploadMultiple(files: File[], options?: { folder?: string; onProgress?: (progress: UploadProgress[]) => void }): Promise<Attachment[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (options?.folder) formData.append('folder', options.folder);
    return api.post(`${BASE_URL}/upload-multiple`, formData);
  },

  async getFile(id: string): Promise<Attachment> {
    return api.get(`${BASE_URL}/files/${id}`);
  },

  async getFiles(filters?: AttachmentFilters, page = 1, pageSize = 20): Promise<{ data: Attachment[]; total: number }> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filters) Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    return api.get(`${BASE_URL}/files?${params}`);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`${BASE_URL}/files/${id}`);
  },

  async deleteMultiple(ids: string[]): Promise<void> {
    return api.post(`${BASE_URL}/files/delete-multiple`, { ids });
  },

  async move(id: string, targetFolder: string): Promise<Attachment> {
    return api.post(`${BASE_URL}/files/${id}/move`, { targetFolder });
  },

  async copy(id: string, targetFolder: string): Promise<Attachment> {
    return api.post(`${BASE_URL}/files/${id}/copy`, { targetFolder });
  },

  async rename(id: string, newName: string): Promise<Attachment> {
    return api.put(`${BASE_URL}/files/${id}`, { name: newName });
  },

  async getDownloadUrl(id: string, expiresIn = 3600): Promise<{ url: string; expiresAt: string }> {
    return api.get(`${BASE_URL}/files/${id}/download-url?expiresIn=${expiresIn}`);
  },

  async getStats(): Promise<AttachmentStats> {
    return api.get(`${BASE_URL}/stats`);
  },

  async getQuota(): Promise<{ used: number; total: number; remaining: number }> {
    return api.get(`${BASE_URL}/quota`);
  },

  async createFolder(name: string, parentPath?: string): Promise<{ path: string }> {
    return api.post(`${BASE_URL}/folders`, { name, parentPath });
  },

  async listFolders(path?: string): Promise<{ name: string; path: string; itemCount: number }[]> {
    return api.get(`${BASE_URL}/folders${path ? `?path=${encodeURIComponent(path)}` : ''}`);
  },
};

export default storageService;
