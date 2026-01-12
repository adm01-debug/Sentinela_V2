import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLogin, useLogout, useCurrentUser } from "../useAuth";

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useAuth hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useLogin", () => {
    it("returns mutation function", () => {
      const { result } = renderHook(() => useLogin(), { wrapper });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe("useLogout", () => {
    it("returns mutation function", () => {
      const { result } = renderHook(() => useLogout(), { wrapper });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe("useCurrentUser", () => {
    it("returns query result", () => {
      const { result } = renderHook(() => useCurrentUser(), { wrapper });
      expect(result.current.isLoading).toBeDefined();
    });
  });
});
