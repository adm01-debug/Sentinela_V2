import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AspectRatio } from "../AspectRatio";

describe("AspectRatio Component", () => {
  it("renders children", () => {
    render(
      <AspectRatio ratio={16/9}>
        <img src="/test.jpg" alt="Test" />
      </AspectRatio>
    );
    expect(screen.getByAltText("Test")).toBeInTheDocument();
  });

  it("applies 16:9 aspect ratio", () => {
    render(
      <AspectRatio ratio={16/9} data-testid="aspect">
        <div>Content</div>
      </AspectRatio>
    );
    expect(screen.getByTestId("aspect")).toHaveStyle({ aspectRatio: "16 / 9" });
  });

  it("applies 4:3 aspect ratio", () => {
    render(
      <AspectRatio ratio={4/3} data-testid="aspect">
        <div>Content</div>
      </AspectRatio>
    );
    expect(screen.getByTestId("aspect")).toHaveStyle({ aspectRatio: "4 / 3" });
  });

  it("applies 1:1 square ratio", () => {
    render(
      <AspectRatio ratio={1} data-testid="aspect">
        <div>Content</div>
      </AspectRatio>
    );
    expect(screen.getByTestId("aspect")).toHaveStyle({ aspectRatio: "1 / 1" });
  });

  it("supports custom className", () => {
    render(
      <AspectRatio ratio={16/9} className="custom-aspect" data-testid="aspect">
        <div>Content</div>
      </AspectRatio>
    );
    expect(screen.getByTestId("aspect")).toHaveClass("custom-aspect");
  });
});
