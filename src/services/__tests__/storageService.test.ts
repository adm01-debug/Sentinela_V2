import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn(), get: vi.fn(), delete: vi.fn() },
}));

describe('storageService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should upload file', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({
      data: { id: 'file123', url: 'https://storage.example.com/file.pdf', size: 1024 },
    });
    
    const formData = new FormData();
    formData.append('file', new Blob(['content']), 'test.pdf');
    
    const result = await api.post('/storage/upload', formData);
    expect(result.data.url).toContain('storage');
  });

  it('should get file info', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({
      data: { id: 'file123', name: 'report.pdf', size: 2048, mimeType: 'application/pdf' },
    });
    
    const result = await api.get('/storage/files/file123');
    expect(result.data.mimeType).toBe('application/pdf');
  });

  it('should delete file', async () => {
    const { api } = await import('@/lib/api');
    (api.delete as any).mockResolvedValue({ data: { deleted: true } });
    
    const result = await api.delete('/storage/files/file123');
    expect(result.data.deleted).toBe(true);
  });

  it('should list files', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({
      data: [
        { id: '1', name: 'doc1.pdf' },
        { id: '2', name: 'doc2.xlsx' },
      ],
    });
    
    const result = await api.get('/storage/files');
    expect(result.data).toHaveLength(2);
  });

  it('should get storage usage', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({
      data: { used: 5000000000, total: 10000000000, percentage: 50 },
    });
    
    const result = await api.get('/storage/usage');
    expect(result.data.percentage).toBe(50);
  });

  it('should generate signed URL', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({
      data: { signedUrl: 'https://storage.example.com/file?token=abc', expiresAt: new Date().toISOString() },
    });
    
    const result = await api.post('/storage/files/file123/sign');
    expect(result.data.signedUrl).toContain('token');
  });
});
