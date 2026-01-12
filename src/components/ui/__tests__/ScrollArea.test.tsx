import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollArea, ScrollBar } from "../ScrollArea";

describe("ScrollArea Component", () => {
  it("renders scroll area with content", () => {
    render(<ScrollArea><div>Scrollable content</div></ScrollArea>);
    expect(screen.getByText("Scrollable content")).toBeInTheDocument();
  });

  it("renders scrollbar", () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div style={{ height: "1000px" }}>Tall content</div>
        <ScrollBar />
      </ScrollArea>
    );
    expect(screen.getByTestId("scroll-area")).toBeInTheDocument();
  });

  it("supports horizontal scrollbar", () => {
    render(
      <ScrollArea>
        <div style={{ width: "2000px" }}>Wide content</div>
        <ScrollBar orientation="horizontal" data-testid="h-scrollbar" />
      </ScrollArea>
    );
    expect(screen.getByTestId("h-scrollbar")).toHaveAttribute("data-orientation", "horizontal");
  });

  it("applies custom height", () => {
    render(<ScrollArea className="h-48" data-testid="scroll-area">Content</ScrollArea>);
    expect(screen.getByTestId("scroll-area")).toHaveClass("h-48");
  });

  it("hides scrollbar when type is scroll", () => {
    render(<ScrollArea type="scroll" data-testid="scroll-area">Content</ScrollArea>);
    expect(screen.getByTestId("scroll-area")).toHaveAttribute("data-type", "scroll");
  });
});
