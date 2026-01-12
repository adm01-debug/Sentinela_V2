import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "../Switch";

describe("Switch Component", () => {
  it("renders unchecked by default", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("renders checked when defaultChecked", () => {
    render(<Switch defaultChecked />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("toggles on click", async () => {
    const user = userEvent.setup();
    render(<Switch />);
    
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "false");
    
    await user.click(switchEl);
    expect(switchEl).toHaveAttribute("aria-checked", "true");
  });

  it("calls onCheckedChange when toggled", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<Switch onCheckedChange={handleChange} />);
    await user.click(screen.getByRole("switch"));
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("respects controlled state", () => {
    const { rerender } = render(<Switch checked={false} onCheckedChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    
    rerender(<Switch checked={true} onCheckedChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("is disabled when disabled prop is true", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<Switch disabled onCheckedChange={handleChange} />);
    
    expect(screen.getByRole("switch")).toBeDisabled();
    await user.click(screen.getByRole("switch"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("renders with label", () => {
    render(<Switch label="Enable notifications" />);
    expect(screen.getByLabelText("Enable notifications")).toBeInTheDocument();
  });

  it("supports keyboard interaction", async () => {
    const user = userEvent.setup();
    render(<Switch />);
    
    const switchEl = screen.getByRole("switch");
    switchEl.focus();
    await user.keyboard(" ");
    
    expect(switchEl).toHaveAttribute("aria-checked", "true");
  });

  it("renders different sizes", () => {
    const { rerender } = render(<Switch size="sm" data-testid="switch" />);
    expect(screen.getByTestId("switch")).toHaveClass("h-4", "w-7");
    
    rerender(<Switch size="lg" data-testid="switch" />);
    expect(screen.getByTestId("switch")).toHaveClass("h-6", "w-11");
  });
});
