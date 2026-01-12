import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "../Heading";

describe("Heading Component", () => {
  it("renders heading text", () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders correct heading levels", () => {
    const { rerender } = render(<Heading level={1} data-testid="heading">H1</Heading>);
    expect(screen.getByTestId("heading").tagName).toBe("H1");

    rerender(<Heading level={2} data-testid="heading">H2</Heading>);
    expect(screen.getByTestId("heading").tagName).toBe("H2");

    rerender(<Heading level={3} data-testid="heading">H3</Heading>);
    expect(screen.getByTestId("heading").tagName).toBe("H3");

    rerender(<Heading level={4} data-testid="heading">H4</Heading>);
    expect(screen.getByTestId("heading").tagName).toBe("H4");
  });

  it("applies size styles based on level", () => {
    const { rerender } = render(<Heading level={1} data-testid="heading">H1</Heading>);
    expect(screen.getByTestId("heading")).toHaveClass("text-4xl");

    rerender(<Heading level={2} data-testid="heading">H2</Heading>);
    expect(screen.getByTestId("heading")).toHaveClass("text-3xl");
  });

  it("supports custom size override", () => {
    render(<Heading level={1} size="sm" data-testid="heading">Small H1</Heading>);
    expect(screen.getByTestId("heading")).toHaveClass("text-sm");
  });

  it("applies custom className", () => {
    render(<Heading className="custom-heading" data-testid="heading">Custom</Heading>);
    expect(screen.getByTestId("heading")).toHaveClass("custom-heading");
  });

  it("renders with gradient", () => {
    render(<Heading gradient data-testid="heading">Gradient</Heading>);
    expect(screen.getByTestId("heading")).toHaveClass("bg-gradient-to-r");
  });
});
