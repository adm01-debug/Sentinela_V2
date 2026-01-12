import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnhancedSystemAlert } from "../EnhancedSystemAlert";

describe("EnhancedSystemAlert Component", () => {
  it("renders alert with message", () => {
    render(<EnhancedSystemAlert message="System notification" />);
    expect(screen.getByText("System notification")).toBeInTheDocument();
  });

  it("renders different severity levels", () => {
    const { rerender } = render(<EnhancedSystemAlert severity="info" message="Info" data-testid="alert" />);
    expect(screen.getByTestId("alert")).toHaveClass("bg-blue");

    rerender(<EnhancedSystemAlert severity="warning" message="Warning" data-testid="alert" />);
    expect(screen.getByTestId("alert")).toHaveClass("bg-yellow");

    rerender(<EnhancedSystemAlert severity="error" message="Error" data-testid="alert" />);
    expect(screen.getByTestId("alert")).toHaveClass("bg-red");

    rerender(<EnhancedSystemAlert severity="success" message="Success" data-testid="alert" />);
    expect(screen.getByTestId("alert")).toHaveClass("bg-green");
  });

  it("renders with title", () => {
    render(<EnhancedSystemAlert title="Alert Title" message="Message" />);
    expect(screen.getByText("Alert Title")).toBeInTheDocument();
  });

  it("renders with action button", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    
    render(
      <EnhancedSystemAlert 
        message="Alert" 
        action={{ label: "Retry", onClick: onAction }}
      />
    );
    
    await user.click(screen.getByText("Retry"));
    expect(onAction).toHaveBeenCalled();
  });

  it("dismisses on close button click", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    
    render(<EnhancedSystemAlert message="Dismissible" dismissible onDismiss={onDismiss} />);
    
    await user.click(screen.getByRole("button", { name: /close|dismiss/i }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("renders with icon", () => {
    render(<EnhancedSystemAlert message="With icon" icon={<span data-testid="icon">!</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("supports auto-dismiss", async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    
    render(<EnhancedSystemAlert message="Auto dismiss" autoDismiss={3000} onDismiss={onDismiss} />);
    
    vi.advanceTimersByTime(3000);
    expect(onDismiss).toHaveBeenCalled();
    
    vi.useRealTimers();
  });
});
