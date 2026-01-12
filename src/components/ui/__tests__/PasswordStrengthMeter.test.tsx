import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordStrengthMeter } from "../PasswordStrengthMeter";

describe("PasswordStrengthMeter Component", () => {
  it("renders meter", () => {
    render(<PasswordStrengthMeter password="" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows weak strength", () => {
    render(<PasswordStrengthMeter password="abc" />);
    expect(screen.getByText(/weak/i)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
  });

  it("shows medium strength", () => {
    render(<PasswordStrengthMeter password="Abcd123" />);
    expect(screen.getByText(/medium|fair/i)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  });

  it("shows strong strength", () => {
    render(<PasswordStrengthMeter password="Abcd123!@#" />);
    expect(screen.getByText(/strong/i)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
  });

  it("shows very strong strength", () => {
    render(<PasswordStrengthMeter password="Abcd123!@#$%XyZ" />);
    expect(screen.getByText(/very strong|excellent/i)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("shows requirements list", () => {
    render(<PasswordStrengthMeter password="" showRequirements />);
    
    expect(screen.getByText(/8.*characters/i)).toBeInTheDocument();
    expect(screen.getByText(/uppercase/i)).toBeInTheDocument();
    expect(screen.getByText(/lowercase/i)).toBeInTheDocument();
    expect(screen.getByText(/number/i)).toBeInTheDocument();
  });

  it("marks met requirements", () => {
    render(<PasswordStrengthMeter password="Abc123" showRequirements />);
    
    expect(screen.getByText(/uppercase/i).closest("li")).toHaveAttribute("data-met", "true");
    expect(screen.getByText(/lowercase/i).closest("li")).toHaveAttribute("data-met", "true");
    expect(screen.getByText(/number/i).closest("li")).toHaveAttribute("data-met", "true");
  });

  it("applies correct color classes", () => {
    const { rerender } = render(<PasswordStrengthMeter password="abc" data-testid="meter" />);
    expect(screen.getByTestId("meter")).toHaveClass("bg-red");
    
    rerender(<PasswordStrengthMeter password="Abcd123!@#$%XyZ" data-testid="meter" />);
    expect(screen.getByTestId("meter")).toHaveClass("bg-green");
  });
});
