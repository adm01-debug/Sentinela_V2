import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PullToRefresh } from "../PullToRefresh";

describe("PullToRefresh Component", () => {
  it("renders children", () => {
    render(
      <PullToRefresh onRefresh={() => Promise.resolve()}>
        <div>Content</div>
      </PullToRefresh>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("shows indicator on pull", () => {
    render(
      <PullToRefresh onRefresh={() => Promise.resolve()}>
        <div>Content</div>
      </PullToRefresh>
    );
    
    const container = screen.getByText("Content").parentElement;
    fireEvent.touchStart(container!, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(container!, { touches: [{ clientY: 100 }] });
    
    expect(screen.getByTestId("refresh-indicator")).toBeInTheDocument();
  });

  it("calls onRefresh when pulled enough", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    
    render(
      <PullToRefresh onRefresh={onRefresh} pullDistance={80}>
        <div>Content</div>
      </PullToRefresh>
    );
    
    const container = screen.getByText("Content").parentElement;
    fireEvent.touchStart(container!, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(container!, { touches: [{ clientY: 100 }] });
    fireEvent.touchEnd(container!);
    
    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it("shows loading state during refresh", async () => {
    const onRefresh = vi.fn().mockImplementation(() => new Promise(r => setTimeout(r, 100)));
    
    render(
      <PullToRefresh onRefresh={onRefresh}>
        <div>Content</div>
      </PullToRefresh>
    );
    
    const container = screen.getByText("Content").parentElement;
    fireEvent.touchStart(container!, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(container!, { touches: [{ clientY: 100 }] });
    fireEvent.touchEnd(container!);
    
    await waitFor(() => {
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  it("supports disabled state", () => {
    render(
      <PullToRefresh onRefresh={() => Promise.resolve()} disabled>
        <div>Content</div>
      </PullToRefresh>
    );
    
    const container = screen.getByText("Content").parentElement;
    fireEvent.touchStart(container!, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(container!, { touches: [{ clientY: 100 }] });
    
    expect(screen.queryByTestId("refresh-indicator")).not.toBeInTheDocument();
  });
});
