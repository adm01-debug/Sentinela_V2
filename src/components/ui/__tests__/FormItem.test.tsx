import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormItem } from "../FormItem";

describe("FormItem Component", () => {
  it("renders children", () => {
    render(<FormItem><input /></FormItem>);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("applies wrapper styles", () => {
    render(<FormItem data-testid="form-item"><input /></FormItem>);
    expect(screen.getByTestId("form-item")).toHaveClass("space-y-2");
  });

  it("supports custom className", () => {
    render(<FormItem className="custom-form-item" data-testid="form-item"><input /></FormItem>);
    expect(screen.getByTestId("form-item")).toHaveClass("custom-form-item");
  });

  it("passes context to children", () => {
    render(
      <FormItem error>
        <input data-testid="input" />
      </FormItem>
    );
    expect(screen.getByTestId("input").closest("[data-error]")).toHaveAttribute("data-error", "true");
  });
});
