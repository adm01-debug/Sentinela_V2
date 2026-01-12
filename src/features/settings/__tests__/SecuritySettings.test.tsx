import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SecuritySettings } from "../SecuritySettings";

describe("SecuritySettings", () => {
  it("renders password fields", () => {
    render(<SecuritySettings />);
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("calls onSave on submit", () => {
    const onSave = vi.fn();
    render(<SecuritySettings onSave={onSave} />);
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: "current123" } });
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "newpass123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "newpass123" } });
    fireEvent.click(screen.getByText("Update Password"));
    expect(onSave).toHaveBeenCalled();
  });
});
