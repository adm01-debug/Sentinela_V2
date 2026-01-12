import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnhancedTooltip } from "../EnhancedTooltip";

describe("EnhancedTooltip Component", () => {
  it("shows tooltip on hover", async () => {
    const user = userEvent.setup();
    render(
      <EnhancedTooltip content="Tooltip text">
        <button>Hover me</button>
      </EnhancedTooltip>
    );
    
    await user.hover(screen.getByText("Hover me"));
    await waitFor(() => {
      expect(screen.getByText("Tooltip text")).toBeInTheDocument();
    });
  });

  it("hides tooltip on unhover", async () => {
    const user = userEvent.setup();
    render(
      <EnhancedTooltip content="Tooltip text">
        <button>Hover me</button>
      </EnhancedTooltip>
    );
    
    await user.hover(screen.getByText("Hover me"));
    await user.unhover(screen.getByText("Hover me"));
    
    await waitFor(() => {
      expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
    });
  });

  it("supports different placements", async () => {
    const user = userEvent.setup();
    const placements = ["top", "bottom", "left", "right"];
    
    for (const placement of placements) {
      const { unmount } = render(
        <EnhancedTooltip content="Tooltip" placement={placement}>
          <button>Trigger</button>
        </EnhancedTooltip>
      );
      
      await user.hover(screen.getByText("Trigger"));
      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toHaveAttribute("data-placement", placement);
      });
      
      unmount();
    }
  });

  it("renders rich content", async () => {
    const user = userEvent.setup();
    render(
      <EnhancedTooltip content={<div><strong>Bold</strong> text</div>}>
        <button>Hover</button>
      </EnhancedTooltip>
    );
    
    await user.hover(screen.getByText("Hover"));
    await waitFor(() => {
      expect(screen.getByText("Bold")).toBeInTheDocument();
    });
  });

  it("respects delay prop", async () => {
    const user = userEvent.setup();
    render(
      <EnhancedTooltip content="Delayed" delay={500}>
        <button>Hover</button>
      </EnhancedTooltip>
    );
    
    await user.hover(screen.getByText("Hover"));
    expect(screen.queryByText("Delayed")).not.toBeInTheDocument();
  });

  it("supports arrow indicator", async () => {
    const user = userEvent.setup();
    render(
      <EnhancedTooltip content="With arrow" arrow>
        <button>Hover</button>
      </EnhancedTooltip>
    );
    
    await user.hover(screen.getByText("Hover"));
    await waitFor(() => {
      expect(screen.getByTestId("tooltip-arrow")).toBeInTheDocument();
    });
  });
});
