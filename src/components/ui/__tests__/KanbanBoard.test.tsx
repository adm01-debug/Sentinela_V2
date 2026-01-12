import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanBoard } from "../KanbanBoard";

const columns = [
  { id: "todo", title: "To Do", items: [{ id: "1", title: "Task 1" }] },
  { id: "doing", title: "Doing", items: [{ id: "2", title: "Task 2" }] },
  { id: "done", title: "Done", items: [] },
];

describe("KanbanBoard Component", () => {
  it("renders all columns", () => {
    render(<KanbanBoard columns={columns} />);
    
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("Doing")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("renders items in columns", () => {
    render(<KanbanBoard columns={columns} />);
    
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("handles add new item", async () => {
    const user = userEvent.setup();
    const onAddItem = vi.fn();
    
    render(<KanbanBoard columns={columns} onAddItem={onAddItem} />);
    
    const addButton = screen.getAllByRole("button", { name: /add/i })[0];
    await user.click(addButton);
    
    expect(onAddItem).toHaveBeenCalledWith("todo");
  });

  it("supports column actions", async () => {
    const user = userEvent.setup();
    const onColumnAction = vi.fn();
    
    render(<KanbanBoard columns={columns} onColumnAction={onColumnAction} />);
    
    const menuButton = screen.getAllByRole("button", { name: /menu|more/i })[0];
    await user.click(menuButton);
  });

  it("shows empty column message", () => {
    render(<KanbanBoard columns={columns} emptyColumnMessage="No tasks" />);
    
    const doneColumn = screen.getByText("Done").closest("[data-column]");
    expect(doneColumn).toContainHTML("No tasks");
  });

  it("supports custom item renderer", () => {
    render(
      <KanbanBoard
        columns={columns}
        renderItem={(item) => <div data-testid="custom-item">{item.title}</div>}
      />
    );
    
    expect(screen.getAllByTestId("custom-item")).toHaveLength(2);
  });
});
