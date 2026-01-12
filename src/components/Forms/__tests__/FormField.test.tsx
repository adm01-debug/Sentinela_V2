import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormField } from "../FormField";

describe("FormField", () => {
  it("renders label", () => {
    render(<FormField name="test" label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("shows required indicator", () => {
    render(<FormField name="test" label="Test" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<FormField name="test" label="Test" error="Error message" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("calls onChange", () => {
    const onChange = vi.fn();
    render(<FormField name="test" label="Test" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("renders different input types", () => {
    render(<FormField name="test" label="Test" type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });
});
