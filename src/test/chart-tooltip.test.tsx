import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartTooltipContent } from "@/components/charts/ChartTooltip";

vi.mock("@/hooks/useChartColors", () => ({
  useChartColors: () => ({
    primary: "hsl(217, 91%, 60%)",
    secondary: "hsl(142, 76%, 36%)",
  }),
}));

describe("ChartTooltipContent", () => {
  it("returns null when not active", () => {
    const { container } = render(<ChartTooltipContent active={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null with empty payload", () => {
    const { container } = render(<ChartTooltipContent active={true} payload={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders label", () => {
    render(
      <ChartTooltipContent
        active={true}
        label="Monday"
        payload={[{ name: "Users", value: 42, color: "#f00" }]}
      />
    );
    expect(screen.getByText("Monday")).toBeInTheDocument();
  });

  it("renders formatted label", () => {
    render(
      <ChartTooltipContent
        active={true}
        label="2024-01-01"
        labelFormatter={(l) => `Date: ${l}`}
        payload={[{ name: "Count", value: 10, color: "#0f0" }]}
      />
    );
    expect(screen.getByText("Date: 2024-01-01")).toBeInTheDocument();
  });

  it("renders payload entries", () => {
    render(
      <ChartTooltipContent
        active={true}
        payload={[
          { name: "Active", value: 100, color: "#00f" },
          { name: "Idle", value: 50, color: "#f0f" },
        ]}
      />
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Idle")).toBeInTheDocument();
  });

  it("formats values with pt-BR locale by default", () => {
    render(
      <ChartTooltipContent
        active={true}
        payload={[{ name: "Total", value: 1234, color: "#000" }]}
      />
    );
    // toLocaleString('pt-BR') for 1234 should show some formatted number
    expect(screen.getByText(/1.*234/)).toBeInTheDocument();
  });

  it("uses custom valueFormatter", () => {
    render(
      <ChartTooltipContent
        active={true}
        valueFormatter={(v) => `${v}h`}
        payload={[{ name: "Hours", value: 8, color: "#000" }]}
      />
    );
    expect(screen.getByText("8h")).toBeInTheDocument();
  });

  it("renders color indicator dots", () => {
    const { container } = render(
      <ChartTooltipContent
        active={true}
        payload={[{ name: "Test", value: 5, color: "rgb(255, 0, 0)" }]}
      />
    );
    const dot = container.querySelector(".rounded-full.ring-1");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveStyle({ backgroundColor: "rgb(255, 0, 0)" });
  });

  it("renders without label", () => {
    const { container } = render(
      <ChartTooltipContent active={true} payload={[{ name: "Data", value: 42, color: "#000" }]} />
    );
    expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
    expect(screen.getByText("Data")).toBeInTheDocument();
  });
});
