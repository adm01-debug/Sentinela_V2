import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentActivity } from "../RecentActivity";

const mockActivities = [
  { id: "1", type: "login" as const, message: "User logged in", timestamp: new Date().toISOString() },
  { id: "2", type: "violation" as const, message: "Policy violation", timestamp: new Date().toISOString() },
];

describe("RecentActivity", () => {
  it("renders activity items", () => {
    render(<RecentActivity activities={mockActivities} />);
    expect(screen.getByText("User logged in")).toBeInTheDocument();
    expect(screen.getByText("Policy violation")).toBeInTheDocument();
  });

  it("shows activity timestamps", () => {
    render(<RecentActivity activities={mockActivities} />);
    expect(screen.getAllByText(/ago/)).toHaveLength(2);
  });
});
