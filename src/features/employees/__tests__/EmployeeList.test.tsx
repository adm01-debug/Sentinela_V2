import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmployeeList } from "../EmployeeList";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe("EmployeeList", () => {
  it("renders loading state", () => {
    render(<EmployeeList />, { wrapper });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("accepts filters prop", () => {
    render(<EmployeeList filters={{ department: "engineering" }} />, { wrapper });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
