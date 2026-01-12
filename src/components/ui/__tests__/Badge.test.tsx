import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge Component", () => {
  it("renders with text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders default variant", () => {
    render(<Badge data-testid="badge">Default</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-primary");
  });

  it("renders secondary variant", () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-secondary");
  });

  it("renders destructive variant", () => {
    render(<Badge variant="destructive" data-testid="badge">Error</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-destructive");
  });

  it("renders outline variant", () => {
    render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("text-foreground");
  });

  it("renders success variant", () => {
    render(<Badge variant="success" data-testid="badge">Success</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-green");
  });

  it("renders warning variant", () => {
    render(<Badge variant="warning" data-testid="badge">Warning</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-yellow");
  });

  it("applies custom className", () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("custom-badge");
  });

  it("renders with icon", () => {
    render(<Badge icon={<span data-testid="icon">★</span>}>With Icon</Badge>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders dot indicator", () => {
    render(<Badge dot data-testid="badge">Dot</Badge>);
    expect(screen.getByTestId("badge").querySelector(".dot")).toBeInTheDocument();
  });

  it("renders different sizes", () => {
    const { rerender } = render(<Badge size="sm" data-testid="badge">Small</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("text-xs");

    rerender(<Badge size="lg" data-testid="badge">Large</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("text-base");
  });
});
