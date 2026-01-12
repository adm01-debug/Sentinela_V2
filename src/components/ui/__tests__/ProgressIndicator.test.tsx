import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressIndicator, CircularProgress, LinearProgress, StepProgress } from "../ProgressIndicator";

describe("ProgressIndicator Component", () => {
  describe("LinearProgress", () => {
    it("renders progress bar", () => {
      render(<LinearProgress value={50} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    });

    it("shows percentage label", () => {
      render(<LinearProgress value={75} showLabel />);
      expect(screen.getByText("75%")).toBeInTheDocument();
    });

    it("renders indeterminate state", () => {
      render(<LinearProgress indeterminate data-testid="progress" />);
      expect(screen.getByTestId("progress")).toHaveClass("animate-pulse");
    });
  });

  describe("CircularProgress", () => {
    it("renders circular progress", () => {
      render(<CircularProgress value={50} data-testid="circular" />);
      expect(screen.getByTestId("circular")).toBeInTheDocument();
    });

    it("shows value in center", () => {
      render(<CircularProgress value={60} showValue />);
      expect(screen.getByText("60%")).toBeInTheDocument();
    });

    it("renders different sizes", () => {
      const { rerender } = render(<CircularProgress value={50} size="sm" data-testid="circular" />);
      expect(screen.getByTestId("circular")).toHaveClass("h-8");
      
      rerender(<CircularProgress value={50} size="lg" data-testid="circular" />);
      expect(screen.getByTestId("circular")).toHaveClass("h-16");
    });
  });

  describe("StepProgress", () => {
    it("renders steps", () => {
      render(<StepProgress steps={["Step 1", "Step 2", "Step 3"]} currentStep={1} />);
      expect(screen.getByText("Step 1")).toBeInTheDocument();
      expect(screen.getByText("Step 2")).toBeInTheDocument();
    });

    it("shows completed steps", () => {
      render(<StepProgress steps={["A", "B", "C"]} currentStep={2} />);
      expect(screen.getByText("A").closest("[data-completed]")).toHaveAttribute("data-completed", "true");
    });
  });
});
