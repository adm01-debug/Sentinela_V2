import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TreeView, TreeItem } from "../TreeView";

const treeData = [
  {
    id: "1",
    label: "Parent 1",
    children: [
      { id: "1-1", label: "Child 1-1" },
      { id: "1-2", label: "Child 1-2" },
    ],
  },
  { id: "2", label: "Parent 2" },
];

describe("TreeView Component", () => {
  it("renders tree items", () => {
    render(<TreeView data={treeData} />);
    
    expect(screen.getByText("Parent 1")).toBeInTheDocument();
    expect(screen.getByText("Parent 2")).toBeInTheDocument();
  });

  it("expands node on click", async () => {
    const user = userEvent.setup();
    render(<TreeView data={treeData} />);
    
    await user.click(screen.getByText("Parent 1"));
    expect(screen.getByText("Child 1-1")).toBeInTheDocument();
  });

  it("collapses expanded node", async () => {
    const user = userEvent.setup();
    render(<TreeView data={treeData} defaultExpanded={["1"]} />);
    
    expect(screen.getByText("Child 1-1")).toBeInTheDocument();
    await user.click(screen.getByText("Parent 1"));
    expect(screen.queryByText("Child 1-1")).not.toBeInTheDocument();
  });

  it("handles selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    
    render(<TreeView data={treeData} onSelect={onSelect} />);
    
    await user.click(screen.getByText("Parent 2"));
    expect(onSelect).toHaveBeenCalledWith("2");
  });

  it("supports multi-select", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    
    render(<TreeView data={treeData} multiSelect onSelect={onSelect} />);
    
    await user.click(screen.getByText("Parent 1"));
    await user.click(screen.getByText("Parent 2"), { ctrlKey: true });
    
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("renders with checkboxes", () => {
    render(<TreeView data={treeData} checkable />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<TreeView data={treeData} />);
    
    screen.getByText("Parent 1").focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByText("Parent 2")).toHaveFocus();
  });
});
