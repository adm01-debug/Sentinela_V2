import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('import utils', () => {
  describe('CSV import', () => {
    const parseCSV = (csv: string): Record<string, string>[] => {
      const lines = csv.trim().split('
');
      if (lines.length < 2) return [];
      
      const headers = lines[0].split(',').map(h => h.trim());
      return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj, header, i) => {
          obj[header] = values[i] || '';
          return obj;
        }, {} as Record<string, string>);
      });
    };

    it('should parse CSV string', () => {
      const csv = 'name,age
John,30
Jane,25';
      const result = parseCSV(csv);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('John');
      expect(result[0].age).toBe('30');
    });

    it('should handle empty CSV', () => {
      const result = parseCSV('');
      expect(result).toHaveLength(0);
    });

    it('should handle headers only', () => {
      const csv = 'name,age';
      const result = parseCSV(csv);
      expect(result).toHaveLength(0);
    });

    it('should handle missing values', () => {
      const csv = 'name,age,email
John,30,';
      const result = parseCSV(csv);
      expect(result[0].email).toBe('');
    });

    it('should trim whitespace', () => {
      const csv = 'name, age
 John , 30 ';
      const result = parseCSV(csv);
      expect(result[0].name).toBe('John');
    });
  });

  describe('JSON import', () => {
    it('should parse JSON string', () => {
      const json = '{"name":"John","age":30}';
      const result = JSON.parse(json);
      expect(result.name).toBe('John');
    });

    it('should parse JSON array', () => {
      const json = '[{"name":"John"},{"name":"Jane"}]';
      const result = JSON.parse(json);
      expect(result).toHaveLength(2);
    });

    it('should handle invalid JSON', () => {
      expect(() => JSON.parse('invalid')).toThrow();
    });

    it('should parse nested JSON', () => {
      const json = '{"user":{"name":"John","address":{"city":"NYC"}}}';
      const result = JSON.parse(json);
      expect(result.user.address.city).toBe('NYC');
    });
  });

  describe('file validation', () => {
    it('should validate file extension', () => {
      const isValidExtension = (filename: string, allowed: string[]) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        return allowed.includes(ext || '');
      };

      expect(isValidExtension('data.csv', ['csv', 'xlsx'])).toBe(true);
      expect(isValidExtension('data.pdf', ['csv', 'xlsx'])).toBe(false);
    });

    it('should validate file size', () => {
      const isValidSize = (size: number, maxMB: number) => 
        size <= maxMB * 1024 * 1024;

      expect(isValidSize(1000000, 5)).toBe(true);  // 1MB < 5MB
      expect(isValidSize(10000000, 5)).toBe(false); // 10MB > 5MB
    });

    it('should validate MIME type', () => {
      const isValidMime = (mime: string, allowed: string[]) => 
        allowed.includes(mime);

      expect(isValidMime('text/csv', ['text/csv', 'application/json'])).toBe(true);
      expect(isValidMime('image/png', ['text/csv', 'application/json'])).toBe(false);
    });
  });

  describe('data transformation', () => {
    it('should map imported data to model', () => {
      const mapToModel = (data: any) => ({
        id: data.ID || data.id,
        name: data.Name || data.name,
        email: data.Email || data.email?.toLowerCase(),
      });

      const imported = { ID: '1', Name: 'John', Email: 'JOHN@TEST.COM' };
      const mapped = mapToModel(imported);
      expect(mapped.email).toBe('john@test.com');
    });

    it('should filter invalid rows', () => {
      const data = [
        { name: 'John', email: 'john@test.com' },
        { name: '', email: '' },
        { name: 'Jane', email: 'jane@test.com' },
      ];
      const valid = data.filter(row => row.name && row.email);
      expect(valid).toHaveLength(2);
    });

    it('should deduplicate by key', () => {
      const data = [
        { id: '1', name: 'John' },
        { id: '1', name: 'John Updated' },
        { id: '2', name: 'Jane' },
      ];
      const unique = [...new Map(data.map(item => [item.id, item])).values()];
      expect(unique).toHaveLength(2);
    });
  });

  describe('progress tracking', () => {
    it('should report import progress', () => {
      const onProgress = vi.fn();
      const total = 100;
      
      for (let i = 0; i <= total; i += 10) {
        onProgress(i / total * 100);
      }
      
      expect(onProgress).toHaveBeenCalledTimes(11);
      expect(onProgress).toHaveBeenLastCalledWith(100);
    });
  });
});
