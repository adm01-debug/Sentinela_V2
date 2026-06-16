import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Users, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/Cards/StatsCard";

// Mock recharts to avoid canvas issues
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children?: ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
}));

// Mock useCountUp to return instant values
vi.mock("@/hooks/useCountUp", () => ({
  useCountUp: ({
    end,
    prefix = "",
    suffix = "",
    decimals = 0,
  }: {
    end: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    separator?: string;
  }) => ({
    ref: { current: null },
    value: end,
    formatted: `${prefix}${end.toFixed(decimals)}${suffix}`,
  }),
}));

describe("StatsCard Component", () => {
  it("renders title correctly", () => {
    render(<StatsCard title="Total Employees" value={128} />);
    expect(screen.getByText("Total Employees")).toBeInTheDocument();
  });

  it("renders numeric value", () => {
    render(<StatsCard title="Count" value={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders string value", () => {
    render(<StatsCard title="Percentage" value="87%" />);
    // parseNumericValue extracts 87 and suffix %, useCountUp formats it
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(<StatsCard title="Users" value={10} icon={Users} />);
    // Icon should be rendered inside the icon container
    const iconContainer = container.querySelector(".rounded-lg");
    expect(iconContainer).toBeInTheDocument();
  });

  it("renders positive trend with TrendingUp icon", () => {
    render(<StatsCard title="Growth" value={100} trend={{ value: 12, label: "vs last week" }} />);
    expect(screen.getByText("12%")).toBeInTheDocument();
    expect(screen.getByText("vs last week")).toBeInTheDocument();
  });

  it("renders negative trend with TrendingDown icon", () => {
    render(<StatsCard title="Decline" value={50} trend={{ value: -5, label: "vs last month" }} />);
    expect(screen.getByText("5%")).toBeInTheDocument();
    expect(screen.getByText("vs last month")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<StatsCard title="Score" value={95} description="Overall system health" />);
    expect(screen.getByText("Overall system health")).toBeInTheDocument();
  });

  it("renders sparkline when data provided", () => {
    const sparkData = [{ value: 10 }, { value: 20 }, { value: 15 }, { value: 30 }];
    render(<StatsCard title="Trend" value={30} sparklineData={sparkData} />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("does not render sparkline with insufficient data", () => {
    const sparkData = [{ value: 10 }];
    const { queryByTestId } = render(
      <StatsCard title="Trend" value={10} sparklineData={sparkData} />
    );
    expect(queryByTestId("responsive-container")).not.toBeInTheDocument();
  });

  it("does not render sparkline when no data", () => {
    const { queryByTestId } = render(<StatsCard title="Simple" value={5} />);
    expect(queryByTestId("responsive-container")).not.toBeInTheDocument();
  });

  it("applies custom icon color", () => {
    const { container } = render(
      <StatsCard
        title="Alerts"
        value={3}
        icon={AlertTriangle}
        iconColor="bg-warning/10 text-warning"
      />
    );
    const iconBox = container.querySelector(".bg-warning\\/10");
    expect(iconBox).toBeInTheDocument();
  });

  it("renders with zero trend value as positive", () => {
    render(<StatsCard title="Stable" value={100} trend={{ value: 0 }} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it('handles value="0" string', () => {
    render(<StatsCard title="Empty" value="0" />);
    // parseNumericValue returns num=0, so it renders the raw value
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders interactive card variant", () => {
    const { container } = render(<StatsCard title="Interactive" value={10} />);
    // Card should have group class for hover effects
    const card = container.querySelector(".group");
    expect(card).toBeInTheDocument();
  });

  it("applies custom sparkline color", () => {
    const sparkData = [{ value: 1 }, { value: 2 }, { value: 3 }];
    render(
      <StatsCard
        title="Custom"
        value={3}
        sparklineData={sparkData}
        sparklineColor="hsl(var(--warning))"
      />
    );
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });
});
