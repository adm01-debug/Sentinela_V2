import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReportsPage from "../ReportsPage";
import * as useReportsHook from "@/hooks/useReports";

// Mocks
vi.mock("@/hooks/useReports", () => ({
  useReports: vi.fn(),
  useReportTemplates: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.mocked(useReportsHook.useReports).mockReturnValue({
      data: {
        data: [
          { id: "1", name: "Annual Sales", status: "completed" },
          { id: "2", name: "Monthly Performance", status: "pending" },
        ],
      },
      isLoading: false,
    } as any);

    vi.mocked(useReportsHook.useReportTemplates).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
  });

  const renderReports = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ReportsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it("renders correctly", () => {
    renderReports();
    expect(screen.getByText("Relatórios")).toBeInTheDocument();
    expect(screen.getByText("Annual Sales")).toBeInTheDocument();
    expect(screen.getByText("Monthly Performance")).toBeInTheDocument();
  });

  it("shows empty state when no reports", () => {
    vi.mocked(useReportsHook.useReports).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as any);
    renderReports();
    expect(screen.queryByText("Annual Sales")).not.toBeInTheDocument();
  });
});
