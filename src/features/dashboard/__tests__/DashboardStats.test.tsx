import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardStats } from "../DashboardStats";

describe("DashboardStats", () => {
  it("renders all stat cards", () => {
    render(<DashboardStats />);
    expect(screen.getByText("Total Employees")).toBeInTheDocument();
    expect(screen.getByText("Active Now")).toBeInTheDocument();
    expect(screen.getByText("Violations")).toBeInTheDocument();
    expect(screen.getByText("Productivity")).toBeInTheDocument();
  });

  it("displays stats values", () => {
    render(<DashboardStats stats={{ totalEmployees: 100, activeNow: 50, violations: 5, productivity: 85 }} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });
});
