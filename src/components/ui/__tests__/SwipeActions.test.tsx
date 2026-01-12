import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SwipeActions } from "../SwipeActions";

describe("SwipeActions Component", () => {
  it("renders children", () => {
    render(
      <SwipeActions leftActions={[]} rightActions={[]}>
        <div>Swipeable content</div>
      </SwipeActions>
    );
    expect(screen.getByText("Swipeable content")).toBeInTheDocument();
  });

  it("renders left actions on swipe right", () => {
    const leftActions = [{ label: "Edit", onClick: vi.fn() }];
    
    render(
      <SwipeActions leftActions={leftActions} rightActions={[]}>
        <div>Content</div>
      </SwipeActions>
    );
    
    const content = screen.getByText("Content");
    fireEvent.touchStart(content, { touches: [{ clientX: 0 }] });
    fireEvent.touchMove(content, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(content);
    
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders right actions on swipe left", () => {
    const rightActions = [{ label: "Delete", onClick: vi.fn(), destructive: true }];
    
    render(
      <SwipeActions leftActions={[]} rightActions={rightActions}>
        <div>Content</div>
      </SwipeActions>
    );
    
    const content = screen.getByText("Content");
    fireEvent.touchStart(content, { touches: [{ clientX: 100 }] });
    fireEvent.touchMove(content, { touches: [{ clientX: 0 }] });
    fireEvent.touchEnd(content);
    
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("triggers action on click", () => {
    const onClick = vi.fn();
    const rightActions = [{ label: "Delete", onClick }];
    
    render(
      <SwipeActions leftActions={[]} rightActions={rightActions} revealed="right">
        <div>Content</div>
      </SwipeActions>
    );
    
    fireEvent.click(screen.getByText("Delete"));
    expect(onClick).toHaveBeenCalled();
  });

  it("resets on tap elsewhere", () => {
    render(
      <SwipeActions leftActions={[{ label: "Edit", onClick: vi.fn() }]} rightActions={[]} revealed="left">
        <div>Content</div>
      </SwipeActions>
    );
    
    fireEvent.click(screen.getByText("Content"));
    expect(screen.queryByText("Edit")).not.toBeVisible();
  });
});
