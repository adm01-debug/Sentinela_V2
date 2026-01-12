import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormMessage } from "../FormMessage";

describe("FormMessage Component", () => {
  it("renders message text", () => {
    render(<FormMessage>This field is required</FormMessage>);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("renders error variant", () => {
    render(<FormMessage variant="error" data-testid="msg">Error</FormMessage>);
    expect(screen.getByTestId("msg")).toHaveClass("text-destructive");
  });

  it("renders success variant", () => {
    render(<FormMessage variant="success" data-testid="msg">Success</FormMessage>);
    expect(screen.getByTestId("msg")).toHaveClass("text-green");
  });

  it("renders warning variant", () => {
    render(<FormMessage variant="warning" data-testid="msg">Warning</FormMessage>);
    expect(screen.getByTestId("msg")).toHaveClass("text-yellow");
  });

  it("renders helper variant", () => {
    render(<FormMessage variant="helper" data-testid="msg">Helper</FormMessage>);
    expect(screen.getByTestId("msg")).toHaveClass("text-muted-foreground");
  });

  it("renders with icon", () => {
    render(<FormMessage icon={<span data-testid="icon">!</span>}>With icon</FormMessage>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("supports custom className", () => {
    render(<FormMessage className="custom-msg" data-testid="msg">Message</FormMessage>);
    expect(screen.getByTestId("msg")).toHaveClass("custom-msg");
  });
});
