import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Headers, PageHeader, SectionHeader } from "../Headers";

describe("Headers Component", () => {
  describe("PageHeader", () => {
    it("renders title", () => {
      render(<PageHeader title="Dashboard" />);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("renders subtitle", () => {
      render(<PageHeader title="Dashboard" subtitle="Overview" />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
    });

    it("renders actions", () => {
      render(<PageHeader title="Dashboard" actions={<button>Action</button>} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders breadcrumbs", () => {
      const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Dashboard" }];
      render(<PageHeader title="Dashboard" breadcrumbs={breadcrumbs} />);
      expect(screen.getByText("Home")).toBeInTheDocument();
    });
  });

  describe("SectionHeader", () => {
    it("renders title", () => {
      render(<SectionHeader title="Settings" />);
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("renders description", () => {
      render(<SectionHeader title="Settings" description="Manage your preferences" />);
      expect(screen.getByText("Manage your preferences")).toBeInTheDocument();
    });

    it("renders with divider", () => {
      render(<SectionHeader title="Settings" divider data-testid="header" />);
      expect(screen.getByTestId("header")).toHaveClass("border-b");
    });
  });
});
