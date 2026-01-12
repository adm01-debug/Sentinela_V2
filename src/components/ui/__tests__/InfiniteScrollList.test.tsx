import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { InfiniteScrollList } from "../InfiniteScrollList";

const initialItems = [{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }];

describe("InfiniteScrollList Component", () => {
  it("renders initial items", () => {
    render(
      <InfiniteScrollList
        items={initialItems}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        loadMore={() => {}}
        hasMore={true}
      />
    );
    
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("shows loading indicator", () => {
    render(
      <InfiniteScrollList
        items={initialItems}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        loadMore={() => {}}
        hasMore={true}
        loading={true}
      />
    );
    
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  it("hides loader when no more items", () => {
    render(
      <InfiniteScrollList
        items={initialItems}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        loadMore={() => {}}
        hasMore={false}
      />
    );
    
    expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();
  });

  it("shows end message", () => {
    render(
      <InfiniteScrollList
        items={initialItems}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        loadMore={() => {}}
        hasMore={false}
        endMessage="No more items"
      />
    );
    
    expect(screen.getByText("No more items")).toBeInTheDocument();
  });

  it("handles empty list", () => {
    render(
      <InfiniteScrollList
        items={[]}
        renderItem={(item) => <div>{item.name}</div>}
        loadMore={() => {}}
        hasMore={false}
        emptyMessage="Empty list"
      />
    );
    
    expect(screen.getByText("Empty list")).toBeInTheDocument();
  });
});
