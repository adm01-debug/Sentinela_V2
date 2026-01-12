import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Blockquote } from "../Blockquote";

describe("Blockquote Component", () => {
  it("renders quote text", () => {
    render(<Blockquote>This is a quote</Blockquote>);
    expect(screen.getByText("This is a quote")).toBeInTheDocument();
  });

  it("renders blockquote element", () => {
    render(<Blockquote data-testid="quote">Quote</Blockquote>);
    expect(screen.getByTestId("quote").tagName).toBe("BLOCKQUOTE");
  });

  it("renders citation", () => {
    render(<Blockquote cite="https://source.com" author="John Doe">Quote</Blockquote>);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("applies border styles", () => {
    render(<Blockquote data-testid="quote">Quote</Blockquote>);
    expect(screen.getByTestId("quote")).toHaveClass("border-l-4");
  });

  it("supports different variants", () => {
    const { rerender } = render(<Blockquote variant="default" data-testid="quote">Quote</Blockquote>);
    expect(screen.getByTestId("quote")).toHaveClass("border-gray");
    
    rerender(<Blockquote variant="accent" data-testid="quote">Quote</Blockquote>);
    expect(screen.getByTestId("quote")).toHaveClass("border-primary");
  });

  it("supports custom className", () => {
    render(<Blockquote className="custom-quote" data-testid="quote">Quote</Blockquote>);
    expect(screen.getByTestId("quote")).toHaveClass("custom-quote");
  });
});
