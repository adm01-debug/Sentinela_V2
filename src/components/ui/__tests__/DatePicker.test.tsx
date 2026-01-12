import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "../DatePicker";

describe("DatePicker Component", () => {
  it("renders date picker input", () => {
    render(<DatePicker placeholder="Select date" />);
    expect(screen.getByPlaceholderText("Select date")).toBeInTheDocument();
  });

  it("opens calendar on click", async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    
    await user.click(screen.getByRole("textbox"));
    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
  });

  it("selects a date", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<DatePicker onChange={onChange} />);
    
    await user.click(screen.getByRole("textbox"));
    await user.click(screen.getByText("15"));
    
    expect(onChange).toHaveBeenCalled();
  });

  it("displays selected date", () => {
    const date = new Date(2024, 0, 15);
    render(<DatePicker value={date} />);
    expect(screen.getByDisplayValue(/Jan.*15.*2024/i)).toBeInTheDocument();
  });

  it("respects min/max dates", async () => {
    const user = userEvent.setup();
    const minDate = new Date(2024, 0, 10);
    const maxDate = new Date(2024, 0, 20);
    
    render(<DatePicker minDate={minDate} maxDate={maxDate} />);
    
    await user.click(screen.getByRole("textbox"));
    expect(screen.getByText("5")).toHaveAttribute("aria-disabled", "true");
  });

  it("renders disabled state", () => {
    render(<DatePicker disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("supports date range selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<DatePicker mode="range" onChange={onChange} />);
    
    await user.click(screen.getByRole("textbox"));
    await user.click(screen.getByText("10"));
    await user.click(screen.getByText("20"));
    
    expect(onChange).toHaveBeenCalled();
  });
});
