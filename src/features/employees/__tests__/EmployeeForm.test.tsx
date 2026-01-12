import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmployeeForm } from "../EmployeeForm";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe("EmployeeForm", () => {
  it("renders form fields", () => {
    render(<EmployeeForm />, { wrapper });
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<EmployeeForm />, { wrapper });
    expect(screen.getByRole("button", { name: /create employee/i })).toBeInTheDocument();
  });
});
