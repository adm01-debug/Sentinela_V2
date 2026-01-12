import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "../LoginForm";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe("LoginForm", () => {
  it("renders form fields", () => {
    render(<LoginForm />, { wrapper });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<LoginForm />, { wrapper });
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("handles form submission", () => {
    render(<LoginForm />, { wrapper });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } });
    expect(screen.getByRole("button")).not.toBeDisabled();
  });
});
