import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BaseScatterChart } from "../BaseScatterChart";
import { ThemeProvider } from "@/providers/ThemeProvider";

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

describe("BaseScatterChart", () => {
  const mockData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
  ];
  const mockSeries = [{ dataKey: "series1", name: "Series 1" }];

  it("renders correctly with data", () => {
    render(
      <ThemeProvider>
        <BaseScatterChart data={mockData} series={mockSeries} />
      </ThemeProvider>
    );

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("renders empty state when data is empty", () => {
    render(
      <ThemeProvider>
        <BaseScatterChart data={[]} series={mockSeries} emptyTitle="No data available" />
      </ThemeProvider>
    );

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });
});
