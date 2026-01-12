import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReportList } from "../ReportList";

const mockReports = [
  { id: "1", name: "Weekly Report", type: "productivity", createdAt: "2024-01-15T00:00:00Z", status: "ready" as const },
  { id: "2", name: "Monthly Summary", type: "summary", createdAt: "2024-01-20T00:00:00Z", status: "processing" as const },
];

describe("ReportList", () => {
  it("renders report items", () => {
    render(<ReportList reports={mockReports} />);
    expect(screen.getByText("Weekly Report")).toBeInTheDocument();
    expect(screen.getByText("Monthly Summary")).toBeInTheDocument();
  });

  it("calls onDownload", () => {
    const onDownload = vi.fn();
    render(<ReportList reports={mockReports} onDownload={onDownload} />);
    fireEvent.click(screen.getAllByText("Download")[0]);
    expect(onDownload).toHaveBeenCalledWith("1");
  });

  it("disables download for processing reports", () => {
    render(<ReportList reports={mockReports} />);
    const buttons = screen.getAllByText("Download");
    expect(buttons[1]).toBeDisabled();
  });
});
