import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileSettings } from "../ProfileSettings";

describe("ProfileSettings", () => {
  it("renders form fields", () => {
    render(<ProfileSettings />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it("shows initial data", () => {
    render(<ProfileSettings initialData={{ name: "John", email: "john@test.com" }} />);
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@test.com")).toBeInTheDocument();
  });

  it("calls onSave", () => {
    const onSave = vi.fn();
    render(<ProfileSettings onSave={onSave} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Test" } });
    fireEvent.click(screen.getByText("Save Changes"));
    expect(onSave).toHaveBeenCalled();
  });
});
