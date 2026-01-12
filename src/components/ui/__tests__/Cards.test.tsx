import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Cards } from "../Cards";

const items = [
  { id: 1, title: "Card 1", description: "Description 1" },
  { id: 2, title: "Card 2", description: "Description 2" },
];

describe("Cards Component", () => {
  it("renders all cards", () => {
    render(<Cards items={items} />);
    expect(screen.getByText("Card 1")).toBeInTheDocument();
    expect(screen.getByText("Card 2")).toBeInTheDocument();
  });

  it("supports grid layout", () => {
    render(<Cards items={items} layout="grid" columns={2} data-testid="cards" />);
    expect(screen.getByTestId("cards")).toHaveClass("grid", "grid-cols-2");
  });

  it("supports list layout", () => {
    render(<Cards items={items} layout="list" data-testid="cards" />);
    expect(screen.getByTestId("cards")).toHaveClass("flex", "flex-col");
  });

  it("handles card click", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<Cards items={items} onCardClick={onClick} />);
    
    await user.click(screen.getByText("Card 1"));
    expect(onClick).toHaveBeenCalledWith(items[0]);
  });

  it("renders loading state", () => {
    render(<Cards items={[]} loading />);
    expect(screen.getAllByTestId("skeleton-card")).toHaveLength(3);
  });

  it("renders empty state", () => {
    render(<Cards items={[]} emptyMessage="No cards" />);
    expect(screen.getByText("No cards")).toBeInTheDocument();
  });

  it("supports custom card renderer", () => {
    render(
      <Cards
        items={items}
        renderCard={(item) => <div data-testid="custom-card">{item.title}</div>}
      />
    );
    expect(screen.getAllByTestId("custom-card")).toHaveLength(2);
  });
});
