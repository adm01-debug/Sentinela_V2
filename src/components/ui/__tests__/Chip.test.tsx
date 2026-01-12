import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chip } from "../Chip";

describe("Chip Component", () => {
  it("renders chip with text", () => {
    render(<Chip>Active</Chip>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders different variants", () => {
    const { rerender } = render(<Chip variant="default" data-testid="chip">Default</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("bg-secondary");

    rerender(<Chip variant="primary" data-testid="chip">Primary</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("bg-primary");

    rerender(<Chip variant="success" data-testid="chip">Success</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("bg-green");

    rerender(<Chip variant="warning" data-testid="chip">Warning</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("bg-yellow");

    rerender(<Chip variant="error" data-testid="chip">Error</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("bg-destructive");
  });

  it("renders with icon", () => {
    render(<Chip icon={<span data-testid="icon">✓</span>}>With Icon</Chip>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders deletable chip", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    
    render(<Chip onDelete={onDelete}>Deletable</Chip>);
    
    const deleteButton = screen.getByRole("button");
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalled();
  });

  it("renders different sizes", () => {
    const { rerender } = render(<Chip size="sm" data-testid="chip">Small</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("text-xs");

    rerender(<Chip size="lg" data-testid="chip">Large</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("text-base");
  });

  it("supports custom className", () => {
    render(<Chip className="custom-chip" data-testid="chip">Custom</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("custom-chip");
  });
});
