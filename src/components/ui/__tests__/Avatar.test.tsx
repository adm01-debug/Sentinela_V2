import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback } from "../Avatar";

describe("Avatar Component", () => {
  it("renders with image", async () => {
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    await waitFor(() => {
      expect(screen.getByRole("img")).toBeInTheDocument();
    });
  });

  it("renders fallback when image fails", () => {
    render(
      <Avatar>
        <AvatarImage src="/invalid.jpg" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders different sizes", () => {
    const { rerender } = render(<Avatar size="sm" data-testid="avatar"><AvatarFallback>SM</AvatarFallback></Avatar>);
    expect(screen.getByTestId("avatar")).toHaveClass("h-8", "w-8");

    rerender(<Avatar size="md" data-testid="avatar"><AvatarFallback>MD</AvatarFallback></Avatar>);
    expect(screen.getByTestId("avatar")).toHaveClass("h-10", "w-10");

    rerender(<Avatar size="lg" data-testid="avatar"><AvatarFallback>LG</AvatarFallback></Avatar>);
    expect(screen.getByTestId("avatar")).toHaveClass("h-12", "w-12");
  });

  it("renders rounded variants", () => {
    const { rerender } = render(<Avatar shape="circle" data-testid="avatar"><AvatarFallback>C</AvatarFallback></Avatar>);
    expect(screen.getByTestId("avatar")).toHaveClass("rounded-full");

    rerender(<Avatar shape="square" data-testid="avatar"><AvatarFallback>S</AvatarFallback></Avatar>);
    expect(screen.getByTestId("avatar")).toHaveClass("rounded-md");
  });

  it("renders with status indicator", () => {
    render(<Avatar status="online" data-testid="avatar"><AvatarFallback>U</AvatarFallback></Avatar>);
    expect(screen.getByTestId("avatar").querySelector(".status-indicator")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Avatar className="custom-avatar" data-testid="avatar"><AvatarFallback>U</AvatarFallback></Avatar>);
    expect(screen.getByTestId("avatar")).toHaveClass("custom-avatar");
  });

  it("handles fallback with initials generation", () => {
    render(<Avatar name="John Doe"><AvatarFallback /></Avatar>);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
