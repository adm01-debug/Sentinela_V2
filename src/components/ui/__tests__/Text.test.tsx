import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Text } from "../Text";

describe("Text Component", () => {
  it("renders text content", () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders different sizes", () => {
    const { rerender } = render(<Text size="xs" data-testid="text">XS</Text>);
    expect(screen.getByTestId("text")).toHaveClass("text-xs");

    rerender(<Text size="sm" data-testid="text">SM</Text>);
    expect(screen.getByTestId("text")).toHaveClass("text-sm");

    rerender(<Text size="lg" data-testid="text">LG</Text>);
    expect(screen.getByTestId("text")).toHaveClass("text-lg");

    rerender(<Text size="xl" data-testid="text">XL</Text>);
    expect(screen.getByTestId("text")).toHaveClass("text-xl");
  });

  it("renders different weights", () => {
    const { rerender } = render(<Text weight="normal" data-testid="text">Normal</Text>);
    expect(screen.getByTestId("text")).toHaveClass("font-normal");

    rerender(<Text weight="medium" data-testid="text">Medium</Text>);
    expect(screen.getByTestId("text")).toHaveClass("font-medium");

    rerender(<Text weight="bold" data-testid="text">Bold</Text>);
    expect(screen.getByTestId("text")).toHaveClass("font-bold");
  });

  it("renders as different elements", () => {
    const { rerender } = render(<Text as="p" data-testid="text">Paragraph</Text>);
    expect(screen.getByTestId("text").tagName).toBe("P");

    rerender(<Text as="span" data-testid="text">Span</Text>);
    expect(screen.getByTestId("text").tagName).toBe("SPAN");

    rerender(<Text as="label" data-testid="text">Label</Text>);
    expect(screen.getByTestId("text").tagName).toBe("LABEL");
  });

  it("applies color variants", () => {
    const { rerender } = render(<Text color="muted" data-testid="text">Muted</Text>);
    expect(screen.getByTestId("text")).toHaveClass("text-muted-foreground");

    rerender(<Text color="primary" data-testid="text">Primary</Text>);
    expect(screen.getByTestId("text")).toHaveClass("text-primary");
  });

  it("supports truncation", () => {
    render(<Text truncate data-testid="text">Long text</Text>);
    expect(screen.getByTestId("text")).toHaveClass("truncate");
  });
});
