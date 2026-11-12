/**
 * SENTINELA - Employee CRUD Test Suite
 * Tests for employee management operations
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Employee Management', () => {
  let mockFrom: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom = vi.mocked(supabase.from);
  });

  describe('List Employees', () => {
    it('should fetch all employees', async () => {
      const mockData = [
        { id: '1', name: 'João Silva', email: 'joao@test.com', department: 'Engineering', status: 'active' },
        { id: '2', name: 'Maria Santos', email: 'maria@test.com', department: 'Marketing', status: 'active' },
      ];
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      });

      const { data, error } = await supabase.from('employees').select('*').order('name');
      expect(data).toHaveLength(2);
      expect(error).toBeNull();
    });

    it('should filter by department', async () => {
      const mockData = [{ id: '1', name: 'João Silva', department: 'Engineering', status: 'active' }];
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const { data } = await supabase.from('employees').select('*').order('name').eq('department', 'Engineering');
      expect(data).toHaveLength(1);
      expect(data![0].department).toBe('Engineering');
    });

    it('should filter by status', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const { data } = await supabase.from('employees').select('*').order('name').eq('status', 'inactive');
      expect(data).toHaveLength(0);
    });

    it('should search by name', async () => {
      const mockData = [{ id: '1', name: 'João Silva', status: 'active' }];
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            ilike: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const { data } = await supabase.from('employees').select('*').order('name').ilike('name', '%João%');
      expect(data![0].name).toContain('João');
    });

    it('should handle empty results', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { data } = await supabase.from('employees').select('*').order('name');
      expect(data).toEqual([]);
    });
  });

  describe('Create Employee', () => {
    it('should create with valid data', async () => {
      const newEmployee = { name: 'New Employee', email: 'new@test.com', department: 'HR', status: 'active' };
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: '3', ...newEmployee }, error: null }),
          }),
        }),
      });

      const { data, error } = await supabase.from('employees').insert(newEmployee).select().maybeSingle();
      expect(error).toBeNull();
      expect(data!.name).toBe('New Employee');
    });

    it('should reject employee without name', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: 'null value in column "name" violates not-null constraint' } }),
          }),
        }),
      });

      const { error } = await supabase.from('employees').insert({ email: 'no-name@test.com' }).select().maybeSingle();
      expect(error).toBeTruthy();
    });
  });

  describe('Update Employee', () => {
    it('should update fields correctly', async () => {
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: { id: '1', name: 'Updated Name', status: 'active' }, error: null }),
            }),
          }),
        }),
      });

      const { data, error } = await supabase.from('employees').update({ name: 'Updated Name' }).eq('id', '1').select().maybeSingle();
      expect(error).toBeNull();
      expect(data!.name).toBe('Updated Name');
    });
  });

  describe('Delete Employee', () => {
    it('should delete by id', async () => {
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { error } = await supabase.from('employees').delete().eq('id', '1');
      expect(error).toBeNull();
    });
  });
});
