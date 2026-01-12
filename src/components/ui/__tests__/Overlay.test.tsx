import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Overlay } from "../Overlay";

describe("Overlay Component", () => {
  it("renders overlay when open", () => {
    render(<Overlay open data-testid="overlay" />);
    expect(screen.getByTestId("overlay")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<Overlay open={false} data-testid="overlay" />);
    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<Overlay open onClick={onClick} data-testid="overlay" />);
    await user.click(screen.getByTestId("overlay"));
    
    expect(onClick).toHaveBeenCalled();
  });

  it("applies blur effect", () => {
    render(<Overlay open blur data-testid="overlay" />);
    expect(screen.getByTestId("overlay")).toHaveClass("backdrop-blur");
  });

  it("renders children", () => {
    render(<Overlay open><div data-testid="child">Content</div></Overlay>);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("supports custom className", () => {
    render(<Overlay open className="custom-overlay" data-testid="overlay" />);
    expect(screen.getByTestId("overlay")).toHaveClass("custom-overlay");
  });

  it("has correct z-index", () => {
    render(<Overlay open zIndex={100} data-testid="overlay" />);
    expect(screen.getByTestId("overlay")).toHaveStyle({ zIndex: "100" });
  });
});
