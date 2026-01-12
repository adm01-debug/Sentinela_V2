import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingStates, LoadingSpinner, LoadingSkeleton, LoadingDots, LoadingProgress } from "../LoadingStates";

describe("LoadingStates Component", () => {
  describe("LoadingSpinner", () => {
    it("renders spinner", () => {
      render(<LoadingSpinner data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });

    it("renders different sizes", () => {
      const { rerender } = render(<LoadingSpinner size="sm" data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toHaveClass("h-4");
      
      rerender(<LoadingSpinner size="lg" data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toHaveClass("h-8");
    });
  });

  describe("LoadingSkeleton", () => {
    it("renders skeleton", () => {
      render(<LoadingSkeleton data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });

    it("renders different shapes", () => {
      const { rerender } = render(<LoadingSkeleton variant="text" data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveClass("h-4");
      
      rerender(<LoadingSkeleton variant="circular" data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveClass("rounded-full");
      
      rerender(<LoadingSkeleton variant="rectangular" data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveClass("rounded-md");
    });
  });

  describe("LoadingDots", () => {
    it("renders three dots", () => {
      render(<LoadingDots data-testid="dots" />);
      expect(screen.getByTestId("dots").children).toHaveLength(3);
    });
  });

  describe("LoadingProgress", () => {
    it("renders progress bar", () => {
      render(<LoadingProgress progress={50} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    });
  });
});
