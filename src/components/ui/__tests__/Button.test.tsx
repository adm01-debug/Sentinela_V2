import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";

describe("Button Component", () => {
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("renders with different variants", () => {
      const { rerender } = render(<Button variant="default">Default</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-primary");

      rerender(<Button variant="destructive">Destructive</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-destructive");

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole("button")).toHaveClass("border");

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-secondary");

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole("button")).toHaveClass("hover:bg-accent");

      rerender(<Button variant="link">Link</Button>);
      expect(screen.getByRole("button")).toHaveClass("text-primary");
    });

    it("renders with different sizes", () => {
      const { rerender } = render(<Button size="default">Default</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-10");

      rerender(<Button size="sm">Small</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-9");

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-11");

      rerender(<Button size="icon">Icon</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-10", "w-10");
    });
  });

  describe("Interactions", () => {
    it("handles click events", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not trigger click when disabled", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("States", () => {
    it("shows disabled state", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
      expect(screen.getByRole("button")).toHaveClass("disabled:pointer-events-none");
    });

    it("shows loading state", () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Accessibility", () => {
    it("has correct ARIA attributes", () => {
      render(<Button aria-label="Submit form">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Submit form");
    });

    it("supports keyboard navigation", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Press Enter</Button>);
      
      const button = screen.getByRole("button");
      button.focus();
      fireEvent.keyDown(button, { key: "Enter" });
      
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe("Custom Props", () => {
    it("accepts custom className", () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole("button")).toHaveClass("custom-class");
    });

    it("renders as child when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/link">Link Button</a>
        </Button>
      );
      expect(screen.getByRole("link")).toBeInTheDocument();
    });
  });
});
