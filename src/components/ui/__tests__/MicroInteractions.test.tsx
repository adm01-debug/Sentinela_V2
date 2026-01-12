import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MicroInteractions, Ripple, Hover, Press, Focus } from "../MicroInteractions";

describe("MicroInteractions Component", () => {
  it("applies ripple effect on click", async () => {
    const user = userEvent.setup();
    render(
      <Ripple>
        <button>Click me</button>
      </Ripple>
    );
    
    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("ripple-effect")).toBeInTheDocument();
  });

  it("applies hover animation", async () => {
    const user = userEvent.setup();
    render(
      <Hover scale={1.05}>
        <div data-testid="hoverable">Hover me</div>
      </Hover>
    );
    
    await user.hover(screen.getByTestId("hoverable"));
    expect(screen.getByTestId("hoverable")).toHaveStyle({ transform: "scale(1.05)" });
  });

  it("applies press animation", async () => {
    const user = userEvent.setup();
    render(
      <Press scale={0.95}>
        <button data-testid="pressable">Press me</button>
      </Press>
    );
    
    const btn = screen.getByTestId("pressable");
    await user.pointer({ target: btn, keys: "[MouseLeft>]" });
    expect(btn).toHaveStyle({ transform: "scale(0.95)" });
  });

  it("applies focus ring", async () => {
    const user = userEvent.setup();
    render(
      <Focus>
        <input data-testid="focusable" />
      </Focus>
    );
    
    await user.click(screen.getByTestId("focusable"));
    expect(screen.getByTestId("focusable")).toHaveClass("ring-2");
  });
});
