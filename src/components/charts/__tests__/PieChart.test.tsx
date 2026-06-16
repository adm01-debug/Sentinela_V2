import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BasePieChart } from "../BasePieChart";
import { ThemeProvider } from "@/providers/ThemeProvider";

// Mock ResponsiveContainer as it doesn't render well in JSDOM
vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

describe("BasePieChart", () => {
  const mockData = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
  ];

  it("renders correctly with data", () => {
    render(
      <ThemeProvider>
        <BasePieChart data={mockData} />
      </ThemeProvider>
    );

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("renders empty state when data is empty", () => {
    render(
      <ThemeProvider>
        <BasePieChart data={[]} emptyTitle="No data available" />
      </ThemeProvider>
    );

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });
});
