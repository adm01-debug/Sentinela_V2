import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
  },
}));

import { supabase } from '@/integrations/supabase/client';
import { useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee } from '../useEmployees';

// Setup chain mocks
beforeEach(() => {
  vi.clearAllMocks();
  
  mockSelect.mockReturnValue({ order: mockOrder });
  mockOrder.mockReturnValue({ data: [], error: null });
  mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockDelete.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ data: null, error: null });
  mockSingle.mockReturnValue({ data: null, error: null });
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useEmployees', () => {
  describe('fetching employees', () => {
    it('should fetch employees successfully', async () => {
      const mockEmployees = [
        { id: '1', name: 'João Silva', email: 'joao@example.com', status: 'active' },
        { id: '2', name: 'Maria Santos', email: 'maria@example.com', status: 'active' },
      ];

      mockOrder.mockReturnValue({ data: mockEmployees, error: null });

      const { result } = renderHook(() => useEmployees(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockEmployees);
      expect(supabase.from).toHaveBeenCalledWith('employees');
    });

    it('should handle fetch error', async () => {
      mockOrder.mockReturnValue({ 
        data: null, 
        error: { message: 'Database error' } 
      });

      const { result } = renderHook(() => useEmployees(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should return empty array when no employees', async () => {
      mockOrder.mockReturnValue({ data: [], error: null });

      const { result } = renderHook(() => useEmployees(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });
  });
});

describe('useEmployee', () => {
  it('should fetch single employee by id', async () => {
    const mockEmployee = {
      id: '123',
      name: 'João Silva',
      email: 'joao@example.com',
      status: 'active',
      department: 'TI',
    };

    mockSelect.mockReturnValue({ 
      eq: vi.fn().mockReturnValue({ 
        single: vi.fn().mockReturnValue({ data: mockEmployee, error: null }) 
      }) 
    });

    const { result } = renderHook(() => useEmployee('123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockEmployee);
  });

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useEmployee(undefined as any), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateEmployee', () => {
  it('should create employee successfully', async () => {
    const newEmployee = {
      name: 'Novo Funcionário',
      email: 'novo@example.com',
      status: 'active',
    };

    const createdEmployee = { id: '456', ...newEmployee };

    mockSingle.mockReturnValue({ data: createdEmployee, error: null });

    const { result } = renderHook(() => useCreateEmployee(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(newEmployee);
    });

    expect(mockInsert).toHaveBeenCalledWith(newEmployee);
  });

  it('should handle creation error', async () => {
    mockSingle.mockReturnValue({ 
      data: null, 
      error: { message: 'Email already exists' } 
    });

    const { result } = renderHook(() => useCreateEmployee(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({ name: 'Test', email: 'existing@example.com' })
    ).rejects.toThrow();
  });
});

describe('useUpdateEmployee', () => {
  it('should update employee successfully', async () => {
    mockEq.mockReturnValue({ data: { id: '123', name: 'Updated' }, error: null });

    const { result } = renderHook(() => useUpdateEmployee(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ id: '123', name: 'Updated Name' });
    });

    expect(mockUpdate).toHaveBeenCalledWith({ name: 'Updated Name' });
    expect(mockEq).toHaveBeenCalledWith('id', '123');
  });
});
