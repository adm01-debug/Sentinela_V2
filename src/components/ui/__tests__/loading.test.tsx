import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as Loading from "../loading";

describe("Loading Components", () => {
  describe("Spinner", () => {
    it("renders spinner", () => {
      render(<Loading.Spinner data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });

    it("renders different sizes", () => {
      const { rerender } = render(<Loading.Spinner size="sm" data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toHaveClass("h-4", "w-4");

      rerender(<Loading.Spinner size="lg" data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toHaveClass("h-8", "w-8");
    });
  });

  describe("Skeleton", () => {
    it("renders skeleton", () => {
      render(<Loading.Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toBeInTheDocument();
      expect(screen.getByTestId("skeleton")).toHaveClass("animate-pulse");
    });

    it("renders different variants", () => {
      const { rerender } = render(<Loading.Skeleton variant="text" data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveClass("h-4", "rounded");

      rerender(<Loading.Skeleton variant="circular" data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveClass("rounded-full");

      rerender(<Loading.Skeleton variant="rectangular" data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveClass("rounded-md");
    });

    it("accepts custom dimensions", () => {
      render(<Loading.Skeleton width={200} height={100} data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveStyle({ width: "200px", height: "100px" });
    });
  });

  describe("LoadingOverlay", () => {
    it("renders overlay with spinner", () => {
      render(<Loading.LoadingOverlay />);
      expect(screen.getByTestId("loading-overlay")).toBeInTheDocument();
    });

    it("renders with custom text", () => {
      render(<Loading.LoadingOverlay text="Loading data..." />);
      expect(screen.getByText("Loading data...")).toBeInTheDocument();
    });

    it("supports fullscreen mode", () => {
      render(<Loading.LoadingOverlay fullscreen data-testid="overlay" />);
      expect(screen.getByTestId("overlay")).toHaveClass("fixed", "inset-0");
    });
  });

  describe("ProgressBar", () => {
    it("renders progress bar", () => {
      render(<Loading.ProgressBar value={50} />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("shows correct progress", () => {
      render(<Loading.ProgressBar value={75} max={100} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
    });

    it("renders indeterminate state", () => {
      render(<Loading.ProgressBar indeterminate data-testid="progress" />);
      expect(screen.getByTestId("progress")).toHaveClass("animate-indeterminate");
    });
  });

  describe("LoadingDots", () => {
    it("renders loading dots", () => {
      render(<Loading.LoadingDots data-testid="dots" />);
      expect(screen.getByTestId("dots")).toBeInTheDocument();
    });

    it("renders correct number of dots", () => {
      render(<Loading.LoadingDots count={5} data-testid="dots" />);
      expect(screen.getByTestId("dots").children).toHaveLength(5);
    });
  });

  describe("ShimmerEffect", () => {
    it("renders shimmer", () => {
      render(<Loading.ShimmerEffect data-testid="shimmer">Content</Loading.ShimmerEffect>);
      expect(screen.getByTestId("shimmer")).toHaveClass("shimmer");
    });
  });
});
