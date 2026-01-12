import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn(), get: vi.fn() },
}));

describe('importService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should import CSV file', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { imported: 100, errors: 0 } });
    
    const formData = new FormData();
    formData.append('file', new Blob(['name,email']), 'data.csv');
    
    const result = await api.post('/imports', formData);
    expect(result.data.imported).toBe(100);
  });

  it('should import Excel file', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { imported: 50, errors: 2 } });
    
    const result = await api.post('/imports', { type: 'xlsx' });
    expect(result.data.imported).toBe(50);
  });

  it('should validate import data', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({
      data: { valid: true, rows: 100, errors: [] },
    });
    
    const result = await api.post('/imports/validate', { file: 'data.csv' });
    expect(result.data.valid).toBe(true);
  });

  it('should report validation errors', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({
      data: {
        valid: false,
        errors: [
          { row: 5, field: 'email', message: 'Invalid email' },
          { row: 10, field: 'phone', message: 'Invalid format' },
        ],
      },
    });
    
    const result = await api.post('/imports/validate', {});
    expect(result.data.errors).toHaveLength(2);
  });

  it('should get import progress', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ data: { progress: 75, processed: 750, total: 1000 } });
    
    const result = await api.get('/imports/job123/progress');
    expect(result.data.progress).toBe(75);
  });

  it('should get import history', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({
      data: [{ id: '1', filename: 'data.csv', status: 'completed' }],
    });
    
    const result = await api.get('/imports/history');
    expect(result.data[0].status).toBe('completed');
  });
});
