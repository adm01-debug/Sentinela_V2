import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserDisplay } from "../UserDisplay";

describe("UserDisplay Component", () => {
  it("renders user name", () => {
    render(<UserDisplay name="John Doe" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders avatar", () => {
    render(<UserDisplay name="John Doe" avatar="/avatar.jpg" />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders initials when no avatar", () => {
    render(<UserDisplay name="John Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders email", () => {
    render(<UserDisplay name="John Doe" email="john@example.com" showEmail />);
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("renders status indicator", () => {
    render(<UserDisplay name="John" status="online" data-testid="user" />);
    expect(screen.getByTestId("user").querySelector("[data-status]")).toHaveAttribute("data-status", "online");
  });

  it("renders different sizes", () => {
    const { rerender } = render(<UserDisplay name="John" size="sm" data-testid="user" />);
    expect(screen.getByTestId("user")).toHaveClass("text-sm");
    
    rerender(<UserDisplay name="John" size="lg" data-testid="user" />);
    expect(screen.getByTestId("user")).toHaveClass("text-lg");
  });

  it("renders with role/title", () => {
    render(<UserDisplay name="John Doe" role="Developer" />);
    expect(screen.getByText("Developer")).toBeInTheDocument();
  });
});
