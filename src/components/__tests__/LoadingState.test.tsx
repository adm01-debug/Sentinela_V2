import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "../LoadingState";

describe("LoadingState", () => {
  it("renders default message", () => {
    render(<LoadingState />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<LoadingState message="Please wait" />);
    expect(screen.getByText("Please wait")).toBeInTheDocument();
  });

  it("renders fullscreen mode", () => {
    const { container } = render(<LoadingState fullScreen />);
    expect(container.firstChild).toHaveClass("fixed");
  });
});
