import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InfoCard } from "../InfoCard";

describe("InfoCard", () => {
  it("renders title", () => {
    render(<InfoCard title="Info"><div>Content</div></InfoCard>);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<InfoCard title="Test" description="Some desc"><div>Content</div></InfoCard>);
    expect(screen.getByText("Some desc")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<InfoCard title="Test"><div>Child content</div></InfoCard>);
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders footer", () => {
    render(<InfoCard title="Test" footer={<span>Footer</span>}><div>Content</div></InfoCard>);
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
