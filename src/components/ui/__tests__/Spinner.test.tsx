import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../Spinner";

describe("Spinner Component", () => {
  it("renders spinner", () => {
    render(<Spinner data-testid="spinner" />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders different sizes", () => {
    const { rerender } = render(<Spinner size="sm" data-testid="spinner" />);
    expect(screen.getByTestId("spinner")).toHaveClass("h-4", "w-4");

    rerender(<Spinner size="md" data-testid="spinner" />);
    expect(screen.getByTestId("spinner")).toHaveClass("h-6", "w-6");

    rerender(<Spinner size="lg" data-testid="spinner" />);
    expect(screen.getByTestId("spinner")).toHaveClass("h-8", "w-8");
  });

  it("has animation class", () => {
    render(<Spinner data-testid="spinner" />);
    expect(screen.getByTestId("spinner")).toHaveClass("animate-spin");
  });

  it("accepts custom className", () => {
    render(<Spinner className="custom-spinner" data-testid="spinner" />);
    expect(screen.getByTestId("spinner")).toHaveClass("custom-spinner");
  });

  it("renders with accessible label", () => {
    render(<Spinner aria-label="Loading content" />);
    expect(screen.getByLabelText("Loading content")).toBeInTheDocument();
  });

  it("renders different colors", () => {
    const { rerender } = render(<Spinner color="primary" data-testid="spinner" />);
    expect(screen.getByTestId("spinner")).toHaveClass("text-primary");

    rerender(<Spinner color="secondary" data-testid="spinner" />);
    expect(screen.getByTestId("spinner")).toHaveClass("text-secondary");
  });
});
