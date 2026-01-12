import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast, ToastProvider, useToast } from "../Toast";

describe("Toast Component", () => {
  it("renders toast message", () => {
    render(
      <ToastProvider>
        <Toast open={true} title="Success" description="Operation completed" />
      </ToastProvider>
    );
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Operation completed")).toBeInTheDocument();
  });

  it("renders different variants", () => {
    const { rerender } = render(
      <ToastProvider>
        <Toast open={true} variant="default" data-testid="toast">Default</Toast>
      </ToastProvider>
    );
    expect(screen.getByTestId("toast")).toHaveClass("bg-background");

    rerender(
      <ToastProvider>
        <Toast open={true} variant="destructive" data-testid="toast">Error</Toast>
      </ToastProvider>
    );
    expect(screen.getByTestId("toast")).toHaveClass("destructive");

    rerender(
      <ToastProvider>
        <Toast open={true} variant="success" data-testid="toast">Success</Toast>
      </ToastProvider>
    );
    expect(screen.getByTestId("toast")).toHaveClass("bg-green");
  });

  it("auto-dismisses after duration", async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    
    render(
      <ToastProvider>
        <Toast open={true} duration={3000} onOpenChange={onClose}>Auto close</Toast>
      </ToastProvider>
    );
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith(false);
    });
    
    vi.useRealTimers();
  });

  it("closes on dismiss button click", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(
      <ToastProvider>
        <Toast open={true} onOpenChange={onClose}>Dismissible</Toast>
      </ToastProvider>
    );
    
    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledWith(false);
  });

  it("renders with action button", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    
    render(
      <ToastProvider>
        <Toast open={true} action={<button onClick={onAction}>Undo</button>}>With Action</Toast>
      </ToastProvider>
    );
    
    await user.click(screen.getByText("Undo"));
    expect(onAction).toHaveBeenCalled();
  });

  it("supports custom positioning", () => {
    render(
      <ToastProvider position="top-right">
        <Toast open={true} data-testid="toast">Positioned</Toast>
      </ToastProvider>
    );
    expect(document.querySelector("[data-position]")).toHaveAttribute("data-position", "top-right");
  });
});
