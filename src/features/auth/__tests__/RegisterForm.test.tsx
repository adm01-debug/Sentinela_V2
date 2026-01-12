import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RegisterForm } from "../RegisterForm";

describe("RegisterForm", () => {
  it("renders all form fields", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<RegisterForm />);
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });
});
