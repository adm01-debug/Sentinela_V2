import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCard } from "../StatsCard";
import { Users } from "lucide-react";

describe("StatsCard", () => {
  it("renders title and value", () => {
    render(<StatsCard title="Users" value={100} />);
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders icon", () => {
    render(<StatsCard title="Test" value={50} icon={Users} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("renders positive trend", () => {
    render(<StatsCard title="Test" value={100} trend={{ value: 10 }} />);
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });

  it("renders negative trend", () => {
    render(<StatsCard title="Test" value={100} trend={{ value: -5 }} />);
    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });
});
