import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PageHeader } from "../PageHeader";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<PageHeader title="Test" description="Some description" />);
    expect(screen.getByText("Some description")).toBeInTheDocument();
  });

  it("renders action button", () => {
    const onClick = vi.fn();
    render(<PageHeader title="Test" action={{ label: "Add", onClick }} />);
    fireEvent.click(screen.getByText("Add"));
    expect(onClick).toHaveBeenCalled();
  });

  it("renders children", () => {
    render(<PageHeader title="Test"><span>Child</span></PageHeader>);
    expect(screen.getByText("Child")).toBeInTheDocument();
  });
});
