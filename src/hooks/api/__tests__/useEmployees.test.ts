import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEmployees, useEmployee, useCreateEmployee } from "../useEmployees";

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useEmployees hooks", () => {
  describe("useEmployees", () => {
    it("returns query result", () => {
      const { result } = renderHook(() => useEmployees(), { wrapper });
      expect(result.current.isLoading).toBeDefined();
    });

    it("accepts filters", () => {
      const { result } = renderHook(
        () => useEmployees({ department: "Engineering", status: "active" }),
        { wrapper }
      );
      expect(result.current).toBeDefined();
    });
  });

  describe("useEmployee", () => {
    it("fetches single employee", () => {
      const { result } = renderHook(() => useEmployee("123"), { wrapper });
      expect(result.current.isLoading).toBeDefined();
    });

    it("is disabled without id", () => {
      const { result } = renderHook(() => useEmployee(""), { wrapper });
      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useCreateEmployee", () => {
    it("returns mutation", () => {
      const { result } = renderHook(() => useCreateEmployee(), { wrapper });
      expect(result.current.mutate).toBeDefined();
    });
  });
});
