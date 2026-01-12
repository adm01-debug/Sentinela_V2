import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimePicker } from "../TimePicker";

describe("TimePicker Component", () => {
  it("renders time picker input", () => {
    render(<TimePicker placeholder="Select time" />);
    expect(screen.getByPlaceholderText("Select time")).toBeInTheDocument();
  });

  it("opens time selector on click", async () => {
    const user = userEvent.setup();
    render(<TimePicker />);
    
    await user.click(screen.getByRole("textbox"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  it("displays selected time", () => {
    render(<TimePicker value="14:30" />);
    expect(screen.getByDisplayValue("14:30")).toBeInTheDocument();
  });

  it("supports 12-hour format", () => {
    render(<TimePicker value="14:30" format="12" />);
    expect(screen.getByDisplayValue(/2:30.*PM/i)).toBeInTheDocument();
  });

  it("handles time change", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<TimePicker onChange={onChange} />);
    
    await user.click(screen.getByRole("textbox"));
    await user.click(screen.getByText("10:00"));
    
    expect(onChange).toHaveBeenCalledWith("10:00");
  });

  it("respects min/max time", async () => {
    const user = userEvent.setup();
    render(<TimePicker minTime="09:00" maxTime="17:00" />);
    
    await user.click(screen.getByRole("textbox"));
    expect(screen.getByText("08:00")).toHaveAttribute("aria-disabled", "true");
  });

  it("supports minute intervals", async () => {
    const user = userEvent.setup();
    render(<TimePicker minuteInterval={15} />);
    
    await user.click(screen.getByRole("textbox"));
    expect(screen.queryByText("10:05")).not.toBeInTheDocument();
    expect(screen.getByText("10:15")).toBeInTheDocument();
  });
});
