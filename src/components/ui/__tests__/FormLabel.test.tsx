import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormLabel } from "../FormLabel";

describe("FormLabel Component", () => {
  it("renders label text", () => {
    render(<FormLabel>Username</FormLabel>);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("renders as label element", () => {
    render(<FormLabel data-testid="label">Email</FormLabel>);
    expect(screen.getByTestId("label").tagName).toBe("LABEL");
  });

  it("shows required indicator", () => {
    render(<FormLabel required>Password</FormLabel>);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("associates with input via htmlFor", () => {
    render(<FormLabel htmlFor="email-input">Email</FormLabel>);
    expect(screen.getByText("Email")).toHaveAttribute("for", "email-input");
  });

  it("applies error styles", () => {
    render(<FormLabel error data-testid="label">Invalid</FormLabel>);
    expect(screen.getByTestId("label")).toHaveClass("text-destructive");
  });

  it("supports custom className", () => {
    render(<FormLabel className="custom-label" data-testid="label">Label</FormLabel>);
    expect(screen.getByTestId("label")).toHaveClass("custom-label");
  });
});
