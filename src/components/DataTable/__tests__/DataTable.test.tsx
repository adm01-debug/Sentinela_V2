import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTable } from "../DataTable";

const mockData = [
  { id: "1", name: "John", email: "john@test.com" },
  { id: "2", name: "Jane", email: "jane@test.com" },
];

const columns = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
];

describe("DataTable", () => {
  it("renders table headers", () => {
    render(<DataTable data={mockData} columns={columns} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders data rows", () => {
    render(<DataTable data={mockData} columns={columns} />);
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("jane@test.com")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<DataTable data={[]} columns={columns} isLoading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="No items" />);
    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("shows pagination", () => {
    render(<DataTable data={mockData} columns={columns} page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText(/Page 1 of 5/)).toBeInTheDocument();
  });
});
