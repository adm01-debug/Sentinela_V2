import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as DataDisplay from "../data-display";

describe("Data Display Components", () => {
  describe("StatValue", () => {
    it("renders value", () => {
      render(<DataDisplay.StatValue value={1234} />);
      expect(screen.getByText("1,234")).toBeInTheDocument();
    });

    it("renders with label", () => {
      render(<DataDisplay.StatValue value={100} label="Users" />);
      expect(screen.getByText("Users")).toBeInTheDocument();
    });

    it("formats currency", () => {
      render(<DataDisplay.StatValue value={1000} format="currency" />);
      expect(screen.getByText(/\$1,000/)).toBeInTheDocument();
    });

    it("formats percentage", () => {
      render(<DataDisplay.StatValue value={75} format="percentage" />);
      expect(screen.getByText("75%")).toBeInTheDocument();
    });
  });

  describe("DataList", () => {
    it("renders list items", () => {
      const items = [
        { label: "Name", value: "John" },
        { label: "Email", value: "john@example.com" },
      ];
      render(<DataDisplay.DataList items={items} />);
      
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("renders empty state", () => {
      render(<DataDisplay.DataList items={[]} emptyText="No data" />);
      expect(screen.getByText("No data")).toBeInTheDocument();
    });
  });

  describe("KeyValuePair", () => {
    it("renders key and value", () => {
      render(<DataDisplay.KeyValuePair label="Status" value="Active" />);
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("supports vertical layout", () => {
      render(<DataDisplay.KeyValuePair label="Key" value="Val" layout="vertical" data-testid="kvp" />);
      expect(screen.getByTestId("kvp")).toHaveClass("flex-col");
    });
  });

  describe("ProgressDisplay", () => {
    it("renders progress bar", () => {
      render(<DataDisplay.ProgressDisplay value={60} max={100} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
    });

    it("shows percentage label", () => {
      render(<DataDisplay.ProgressDisplay value={75} max={100} showLabel />);
      expect(screen.getByText("75%")).toBeInTheDocument();
    });
  });

  describe("MetricCard", () => {
    it("renders metric", () => {
      render(<DataDisplay.MetricCard title="Revenue" value="$10,000" />);
      expect(screen.getByText("Revenue")).toBeInTheDocument();
      expect(screen.getByText("$10,000")).toBeInTheDocument();
    });

    it("shows trend", () => {
      render(<DataDisplay.MetricCard title="Users" value="1000" trend={{ value: 10, direction: "up" }} />);
      expect(screen.getByText("+10%")).toBeInTheDocument();
    });
  });
});
