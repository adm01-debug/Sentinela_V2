import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "../Combobox";

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

describe("Combobox Component", () => {
  it("renders combobox input", () => {
    render(<Combobox options={options} placeholder="Select fruit" />);
    expect(screen.getByPlaceholderText("Select fruit")).toBeInTheDocument();
  });

  it("shows options on focus", async () => {
    const user = userEvent.setup();
    render(<Combobox options={options} />);
    
    await user.click(screen.getByRole("combobox"));
    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Banana")).toBeInTheDocument();
    });
  });

  it("filters options on input", async () => {
    const user = userEvent.setup();
    render(<Combobox options={options} />);
    
    await user.type(screen.getByRole("combobox"), "ban");
    await waitFor(() => {
      expect(screen.getByText("Banana")).toBeInTheDocument();
      expect(screen.queryByText("Apple")).not.toBeInTheDocument();
    });
  });

  it("selects option on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<Combobox options={options} onChange={onChange} />);
    
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Cherry"));
    
    expect(onChange).toHaveBeenCalledWith({ value: "cherry", label: "Cherry" });
  });

  it("supports keyboard selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<Combobox options={options} onChange={onChange} />);
    
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    
    expect(onChange).toHaveBeenCalled();
  });

  it("shows no results message", async () => {
    const user = userEvent.setup();
    render(<Combobox options={options} emptyMessage="No fruits found" />);
    
    await user.type(screen.getByRole("combobox"), "xyz");
    await waitFor(() => {
      expect(screen.getByText("No fruits found")).toBeInTheDocument();
    });
  });

  it("supports disabled state", () => {
    render(<Combobox options={options} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
