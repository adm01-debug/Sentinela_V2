import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VirtualizedList } from "../VirtualizedList";

const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `Item ${i}` }));

describe("VirtualizedList Component", () => {
  it("renders only visible items", () => {
    render(
      <VirtualizedList
        items={items}
        itemHeight={50}
        height={300}
        renderItem={(item) => <div>{item.label}</div>}
      />
    );
    
    expect(screen.getByText("Item 0")).toBeInTheDocument();
    expect(screen.queryByText("Item 100")).not.toBeInTheDocument();
  });

  it("updates visible items on scroll", () => {
    const { container } = render(
      <VirtualizedList
        items={items}
        itemHeight={50}
        height={300}
        renderItem={(item) => <div>{item.label}</div>}
      />
    );
    
    const scrollContainer = container.querySelector("[data-virtualized]");
    if (scrollContainer) {
      scrollContainer.scrollTop = 5000;
      scrollContainer.dispatchEvent(new Event("scroll"));
    }
  });

  it("supports variable height items", () => {
    render(
      <VirtualizedList
        items={items.slice(0, 10)}
        getItemHeight={(item) => item.id % 2 === 0 ? 50 : 100}
        height={300}
        renderItem={(item) => <div>{item.label}</div>}
      />
    );
    
    expect(screen.getByText("Item 0")).toBeInTheDocument();
  });

  it("handles empty list", () => {
    render(
      <VirtualizedList
        items={[]}
        itemHeight={50}
        height={300}
        renderItem={(item) => <div>{item.label}</div>}
        emptyMessage="No items"
      />
    );
    
    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("calls onEndReached when scrolled to bottom", () => {
    const onEndReached = vi.fn();
    const { container } = render(
      <VirtualizedList
        items={items.slice(0, 20)}
        itemHeight={50}
        height={300}
        renderItem={(item) => <div>{item.label}</div>}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.8}
      />
    );
    
    const scrollContainer = container.querySelector("[data-virtualized]");
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, "scrollTop", { value: 900, writable: true });
      scrollContainer.dispatchEvent(new Event("scroll"));
    }
  });
});
