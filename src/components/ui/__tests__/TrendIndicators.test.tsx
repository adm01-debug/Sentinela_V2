import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrendIndicators } from "../TrendIndicators";

describe("TrendIndicators Component", () => {
  it("renders upward trend", () => {
    render(<TrendIndicators value={15} direction="up" />);
    expect(screen.getByText("+15%")).toBeInTheDocument();
    expect(screen.getByTestId("trend-up")).toBeInTheDocument();
  });

  it("renders downward trend", () => {
    render(<TrendIndicators value={10} direction="down" />);
    expect(screen.getByText("-10%")).toBeInTheDocument();
    expect(screen.getByTestId("trend-down")).toBeInTheDocument();
  });

  it("renders neutral/flat trend", () => {
    render(<TrendIndicators value={0} direction="neutral" />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByTestId("trend-neutral")).toBeInTheDocument();
  });

  it("applies positive color for up trend", () => {
    render(<TrendIndicators value={10} direction="up" data-testid="trend" />);
    expect(screen.getByTestId("trend")).toHaveClass("text-green");
  });

  it("applies negative color for down trend", () => {
    render(<TrendIndicators value={10} direction="down" data-testid="trend" />);
    expect(screen.getByTestId("trend")).toHaveClass("text-red");
  });

  it("renders with label", () => {
    render(<TrendIndicators value={5} direction="up" label="vs last month" />);
    expect(screen.getByText("vs last month")).toBeInTheDocument();
  });

  it("supports different sizes", () => {
    const { rerender } = render(<TrendIndicators value={5} direction="up" size="sm" data-testid="trend" />);
    expect(screen.getByTestId("trend")).toHaveClass("text-sm");

    rerender(<TrendIndicators value={5} direction="up" size="lg" data-testid="trend" />);
    expect(screen.getByTestId("trend")).toHaveClass("text-lg");
  });

  it("formats large numbers", () => {
    render(<TrendIndicators value={1500} direction="up" />);
    expect(screen.getByText(/1.5k|1,500/)).toBeInTheDocument();
  });
});
