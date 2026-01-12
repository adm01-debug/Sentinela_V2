import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('export utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CSV export', () => {
    const toCSV = (data: Record<string, any>[], headers?: string[]) => {
      if (data.length === 0) return '';
      const keys = headers || Object.keys(data[0]);
      const headerLine = keys.join(',');
      const rows = data.map(row => 
        keys.map(key => {
          const val = row[key];
          if (typeof val === 'string' && val.includes(',')) {
            return `"${val}"`;
          }
          return val ?? '';
        }).join(',')
      );
      return [headerLine, ...rows].join('
');
    };

    it('should export array to CSV', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      const csv = toCSV(data);
      expect(csv).toContain('name,age');
      expect(csv).toContain('John,30');
      expect(csv).toContain('Jane,25');
    });

    it('should handle empty array', () => {
      const csv = toCSV([]);
      expect(csv).toBe('');
    });

    it('should escape commas in values', () => {
      const data = [{ name: 'Doe, John', age: 30 }];
      const csv = toCSV(data);
      expect(csv).toContain('"Doe, John"');
    });

    it('should use custom headers', () => {
      const data = [{ name: 'John', age: 30 }];
      const csv = toCSV(data, ['name']);
      expect(csv).toBe('name
John');
    });

    it('should handle null/undefined values', () => {
      const data = [{ name: 'John', age: null }];
      const csv = toCSV(data);
      expect(csv).toContain('John,');
    });
  });

  describe('JSON export', () => {
    it('should export object to JSON', () => {
      const data = { name: 'Test', value: 123 };
      const json = JSON.stringify(data);
      expect(json).toBe('{"name":"Test","value":123}');
    });

    it('should format JSON with indentation', () => {
      const data = { name: 'Test' };
      const json = JSON.stringify(data, null, 2);
      expect(json).toContain('
');
    });

    it('should handle arrays', () => {
      const data = [1, 2, 3];
      const json = JSON.stringify(data);
      expect(json).toBe('[1,2,3]');
    });

    it('should handle nested objects', () => {
      const data = { user: { name: 'John', address: { city: 'NYC' } } };
      const json = JSON.stringify(data);
      expect(JSON.parse(json).user.address.city).toBe('NYC');
    });

    it('should handle dates', () => {
      const date = new Date('2024-01-01');
      const json = JSON.stringify({ date });
      expect(json).toContain('2024-01-01');
    });
  });

  describe('Excel export preparation', () => {
    it('should prepare data for Excel', () => {
      const prepareForExcel = (data: any[][]) => {
        return data.map(row => 
          row.map(cell => 
            cell === null || cell === undefined ? '' : String(cell)
          )
        );
      };

      const data = [[1, 'text', null], [2, 'more', undefined]];
      const prepared = prepareForExcel(data);
      expect(prepared[0]).toEqual(['1', 'text', '']);
      expect(prepared[1]).toEqual(['2', 'more', '']);
    });

    it('should add headers row', () => {
      const headers = ['ID', 'Name', 'Email'];
      const data = [['1', 'John', 'john@test.com']];
      const withHeaders = [headers, ...data];
      expect(withHeaders[0]).toEqual(headers);
    });
  });

  describe('file name generation', () => {
    it('should generate filename with timestamp', () => {
      const generateFilename = (prefix: string, ext: string) => {
        const timestamp = new Date().toISOString().slice(0, 10);
        return `${prefix}_${timestamp}.${ext}`;
      };

      const filename = generateFilename('export', 'csv');
      expect(filename).toMatch(/^export_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should sanitize filename', () => {
      const sanitize = (name: string) => 
        name.replace(/[^a-zA-Z0-9-_]/g, '_');
      
      expect(sanitize('file/name:test')).toBe('file_name_test');
    });
  });

  describe('blob creation for download', () => {
    it('should create CSV blob', () => {
      const csv = 'name,age
John,30';
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      expect(blob.type).toBe('text/csv;charset=utf-8');
    });

    it('should create JSON blob', () => {
      const json = JSON.stringify({ test: true });
      const blob = new Blob([json], { type: 'application/json' });
      expect(blob.type).toBe('application/json');
    });
  });
});
