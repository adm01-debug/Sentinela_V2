import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ToastProvider, useToast } from "../ToastContext";

describe("ToastContext", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>{children}</ToastProvider>
  );

  it("adds toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.addToast({ title: "Test", type: "success" });
    });
    expect(result.current.toasts).toHaveLength(1);
  });

  it("removes toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.addToast({ title: "Test", type: "success" });
    });
    const id = result.current.toasts[0].id;
    act(() => {
      result.current.removeToast(id);
    });
    expect(result.current.toasts).toHaveLength(0);
  });
});
