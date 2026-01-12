import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SecurityScoreDashboard } from "../SecurityScoreDashboard";

describe("SecurityScoreDashboard Component", () => {
  const mockData = {
    overallScore: 85,
    categories: [
      { name: "Authentication", score: 90, status: "good" },
      { name: "Encryption", score: 75, status: "warning" },
      { name: "Access Control", score: 95, status: "good" },
    ],
    lastUpdated: new Date().toISOString(),
  };

  it("renders overall score", () => {
    render(<SecurityScoreDashboard data={mockData} />);
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("renders all security categories", () => {
    render(<SecurityScoreDashboard data={mockData} />);
    expect(screen.getByText("Authentication")).toBeInTheDocument();
    expect(screen.getByText("Encryption")).toBeInTheDocument();
    expect(screen.getByText("Access Control")).toBeInTheDocument();
  });

  it("shows status indicators", () => {
    render(<SecurityScoreDashboard data={mockData} />);
    expect(screen.getAllByTestId("status-good")).toHaveLength(2);
    expect(screen.getByTestId("status-warning")).toBeInTheDocument();
  });

  it("renders score gauge", () => {
    render(<SecurityScoreDashboard data={mockData} showGauge />);
    expect(screen.getByTestId("score-gauge")).toBeInTheDocument();
  });

  it("shows recommendations", () => {
    const dataWithRecs = {
      ...mockData,
      recommendations: ["Enable 2FA", "Update passwords"],
    };
    
    render(<SecurityScoreDashboard data={dataWithRecs} showRecommendations />);
    expect(screen.getByText("Enable 2FA")).toBeInTheDocument();
  });

  it("displays trend indicators", () => {
    const dataWithTrend = {
      ...mockData,
      trend: { direction: "up", percentage: 5 },
    };
    
    render(<SecurityScoreDashboard data={dataWithTrend} showTrend />);
    expect(screen.getByText("+5%")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<SecurityScoreDashboard loading />);
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });
});
