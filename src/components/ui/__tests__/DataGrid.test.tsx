import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataGrid } from "../DataGrid";

const columns = [
  { key: "name", header: "Name" },
  { key: "age", header: "Age" },
];

const data = [
  { id: 1, name: "John", age: 30 },
  { id: 2, name: "Jane", age: 25 },
];

describe("DataGrid Component", () => {
  it("renders columns and data", () => {
    render(<DataGrid columns={columns} data={data} />);
    
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  it("supports sorting", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    
    render(<DataGrid columns={columns} data={data} sortable onSort={onSort} />);
    
    await user.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name", expect.any(String));
  });

  it("supports row selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    
    render(<DataGrid columns={columns} data={data} selectable onSelectionChange={onSelect} />);
    
    const checkbox = screen.getAllByRole("checkbox")[1];
    await user.click(checkbox);
    expect(onSelect).toHaveBeenCalled();
  });

  it("renders loading state", () => {
    render(<DataGrid columns={columns} data={[]} loading />);
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<DataGrid columns={columns} data={[]} emptyMessage="No data" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("supports pagination", () => {
    render(<DataGrid columns={columns} data={data} pagination pageSize={10} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("supports filtering", async () => {
    const user = userEvent.setup();
    render(<DataGrid columns={columns} data={data} filterable />);
    
    const filterInput = screen.getByPlaceholderText(/filter|search/i);
    await user.type(filterInput, "John");
    
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.queryByText("Jane")).not.toBeInTheDocument();
  });
});
