import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageContent } from "../PageContent";

describe("PageContent", () => {
  it("renders children", () => {
    render(<PageContent><div>Content</div></PageContent>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies className", () => {
    const { container } = render(<PageContent className="custom">Test</PageContent>);
    expect(container.firstChild).toHaveClass("custom");
  });
});
