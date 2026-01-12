import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup, RadioGroupItem } from "../Radio";

describe("Radio Component", () => {
  it("renders radio group with items", () => {
    render(
      <RadioGroup defaultValue="option1">
        <RadioGroupItem value="option1" id="r1" />
        <RadioGroupItem value="option2" id="r2" />
      </RadioGroup>
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("selects option on click", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(
      <RadioGroup onValueChange={handleChange}>
        <RadioGroupItem value="opt1" />
        <RadioGroupItem value="opt2" />
      </RadioGroup>
    );
    
    const radios = screen.getAllByRole("radio");
    await user.click(radios[1]);
    
    expect(handleChange).toHaveBeenCalledWith("opt2");
  });

  it("shows selected state", () => {
    render(
      <RadioGroup defaultValue="selected">
        <RadioGroupItem value="selected" />
        <RadioGroupItem value="other" />
      </RadioGroup>
    );
    
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
  });

  it("disables items when disabled", () => {
    render(
      <RadioGroup disabled>
        <RadioGroupItem value="opt1" />
      </RadioGroup>
    );
    expect(screen.getByRole("radio")).toBeDisabled();
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup defaultValue="first">
        <RadioGroupItem value="first" />
        <RadioGroupItem value="second" />
      </RadioGroup>
    );
    
    const radios = screen.getAllByRole("radio");
    radios[0].focus();
    await user.keyboard("{ArrowDown}");
    
    expect(radios[1]).toHaveFocus();
  });
});
