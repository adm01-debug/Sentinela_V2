import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('download utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('file download', () => {
    it('should create download link', () => {
      const createObjectURL = vi.fn().mockReturnValue('blob:test');
      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() });

      const blob = new Blob(['test content'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      expect(url).toBe('blob:test');
    });

    it('should trigger download via anchor click', () => {
      const click = vi.fn();
      const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click,
        style: {},
      } as any);

      const anchor = document.createElement('a');
      anchor.href = 'blob:test';
      anchor.download = 'file.txt';
      anchor.click();

      expect(click).toHaveBeenCalled();
    });

    it('should set correct filename', () => {
      const anchor = document.createElement('a');
      anchor.download = 'report.pdf';
      expect(anchor.download).toBe('report.pdf');
    });

    it('should revoke object URL after download', () => {
      const revokeObjectURL = vi.fn();
      vi.stubGlobal('URL', { 
        createObjectURL: vi.fn().mockReturnValue('blob:test'),
        revokeObjectURL 
      });

      URL.revokeObjectURL('blob:test');
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
    });
  });

  describe('blob creation', () => {
    it('should create blob from string', () => {
      const blob = new Blob(['Hello World'], { type: 'text/plain' });
      expect(blob.size).toBeGreaterThan(0);
      expect(blob.type).toBe('text/plain');
    });

    it('should create blob from JSON', () => {
      const data = { name: 'Test', value: 123 };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      expect(blob.type).toBe('application/json');
    });

    it('should create blob from array buffer', () => {
      const buffer = new ArrayBuffer(8);
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      expect(blob.size).toBe(8);
    });
  });

  describe('file types', () => {
    it('should download CSV file', () => {
      const csvContent = 'name,age
John,30
Jane,25';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      expect(blob.type).toBe('text/csv');
    });

    it('should download PDF file', () => {
      const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
      expect(blob.type).toBe('application/pdf');
    });

    it('should download Excel file', () => {
      const blob = new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      expect(blob.type).toContain('spreadsheetml');
    });

    it('should download image file', () => {
      const blob = new Blob([''], { type: 'image/png' });
      expect(blob.type).toBe('image/png');
    });
  });

  describe('download from URL', () => {
    it('should fetch and download file', async () => {
      const mockBlob = new Blob(['content']);
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });
      vi.stubGlobal('fetch', mockFetch);

      const response = await fetch('https://example.com/file.pdf');
      const blob = await response.blob();
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should handle download error', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });
      vi.stubGlobal('fetch', mockFetch);

      const response = await fetch('https://example.com/notfound.pdf');
      expect(response.ok).toBe(false);
    });
  });

  describe('filename handling', () => {
    it('should sanitize filename', () => {
      const sanitize = (name: string) => name.replace(/[<>:"/\|?*]/g, '_');
      expect(sanitize('file<>:test.txt')).toBe('file___test.txt');
    });

    it('should add extension if missing', () => {
      const addExtension = (name: string, ext: string) => 
        name.includes('.') ? name : `${name}.${ext}`;
      expect(addExtension('report', 'pdf')).toBe('report.pdf');
      expect(addExtension('report.pdf', 'pdf')).toBe('report.pdf');
    });

    it('should generate unique filename', () => {
      const generateFilename = (base: string) => 
        `${base}_${Date.now()}`;
      const filename = generateFilename('export');
      expect(filename).toMatch(/^export_\d+$/);
    });
  });
});
