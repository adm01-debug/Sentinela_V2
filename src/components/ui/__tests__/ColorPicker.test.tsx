import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorPicker } from "../ColorPicker";

describe("ColorPicker Component", () => {
  it("renders color picker", () => {
    render(<ColorPicker />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows current color", () => {
    render(<ColorPicker value="#ff0000" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveStyle({ backgroundColor: "#ff0000" });
  });

  it("opens picker on click", async () => {
    const user = userEvent.setup();
    render(<ColorPicker />);
    
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("handles color change", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<ColorPicker onChange={onChange} />);
    
    await user.click(screen.getByRole("button"));
    const colorInput = screen.getByDisplayValue(/#[0-9a-f]{6}/i);
    await user.clear(colorInput);
    await user.type(colorInput, "#00ff00");
    
    expect(onChange).toHaveBeenCalled();
  });

  it("shows preset colors", async () => {
    const user = userEvent.setup();
    const presets = ["#ff0000", "#00ff00", "#0000ff"];
    
    render(<ColorPicker presetColors={presets} />);
    
    await user.click(screen.getByRole("button"));
    
    presets.forEach(color => {
      expect(screen.getByTitle(color)).toBeInTheDocument();
    });
  });

  it("supports disabled state", () => {
    render(<ColorPicker disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows alpha slider when showAlpha is true", async () => {
    const user = userEvent.setup();
    render(<ColorPicker showAlpha />);
    
    await user.click(screen.getByRole("button"));
    expect(screen.getByLabelText(/alpha|opacity/i)).toBeInTheDocument();
  });
});
