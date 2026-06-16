import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BaseRadarChart } from "../BaseRadarChart";
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

describe("BaseRadarChart", () => {
  const mockData = [
    { subject: "Math", A: 120, B: 110, fullMark: 150 },
    { subject: "Chinese", A: 98, B: 130, fullMark: 150 },
  ];
  const mockSeries = [{ dataKey: "A", label: "Student A" }];

  it("renders correctly with data", () => {
    render(
      <ThemeProvider>
        <BaseRadarChart data={mockData} series={mockSeries} />
      </ThemeProvider>
    );

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("renders empty state when data is empty", () => {
    render(
      <ThemeProvider>
        <BaseRadarChart data={[]} series={mockSeries} emptyTitle="No data available" />
      </ThemeProvider>
    );

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });
});
