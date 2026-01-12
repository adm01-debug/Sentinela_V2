import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "../Select";

const mockOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

describe("Select Component", () => {
  describe("Rendering", () => {
    it("renders with placeholder", () => {
      render(<Select placeholder="Select an option" options={mockOptions} />);
      expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("renders with label", () => {
      render(<Select label="Choose option" options={mockOptions} />);
      expect(screen.getByText("Choose option")).toBeInTheDocument();
    });

    it("renders all options when opened", async () => {
      const user = userEvent.setup();
      render(<Select placeholder="Select" options={mockOptions} />);
      
      await user.click(screen.getByText("Select"));
      
      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
        expect(screen.getByText("Option 2")).toBeInTheDocument();
        expect(screen.getByText("Option 3")).toBeInTheDocument();
      });
    });
  });

  describe("Selection", () => {
    it("selects an option", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Select placeholder="Select" options={mockOptions} onChange={handleChange} />);
      
      await user.click(screen.getByText("Select"));
      await user.click(screen.getByText("Option 2"));
      
      expect(handleChange).toHaveBeenCalledWith("option2");
    });

    it("displays selected value", async () => {
      const user = userEvent.setup();
      render(<Select placeholder="Select" options={mockOptions} />);
      
      await user.click(screen.getByText("Select"));
      await user.click(screen.getByText("Option 1"));
      
      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
      });
    });

    it("supports default value", () => {
      render(<Select defaultValue="option2" options={mockOptions} />);
      expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    it("supports controlled value", () => {
      const { rerender } = render(<Select value="option1" options={mockOptions} onChange={() => {}} />);
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      
      rerender(<Select value="option3" options={mockOptions} onChange={() => {}} />);
      expect(screen.getByText("Option 3")).toBeInTheDocument();
    });
  });

  describe("Multi-Select", () => {
    it("allows multiple selections", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Select multiple placeholder="Select multiple" options={mockOptions} onChange={handleChange} />);
      
      await user.click(screen.getByText("Select multiple"));
      await user.click(screen.getByText("Option 1"));
      await user.click(screen.getByText("Option 2"));
      
      expect(handleChange).toHaveBeenCalledTimes(2);
    });
  });

  describe("Search/Filter", () => {
    it("filters options based on search", async () => {
      const user = userEvent.setup();
      render(<Select searchable placeholder="Search..." options={mockOptions} />);
      
      await user.click(screen.getByText("Search..."));
      const searchInput = screen.getByRole("combobox");
      await user.type(searchInput, "Option 1");
      
      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
        expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
      });
    });

    it("shows no results message", async () => {
      const user = userEvent.setup();
      render(<Select searchable placeholder="Search..." options={mockOptions} />);
      
      await user.click(screen.getByText("Search..."));
      const searchInput = screen.getByRole("combobox");
      await user.type(searchInput, "nonexistent");
      
      await waitFor(() => {
        expect(screen.getByText(/no results/i)).toBeInTheDocument();
      });
    });
  });

  describe("States", () => {
    it("handles disabled state", () => {
      render(<Select disabled placeholder="Disabled" options={mockOptions} />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-disabled", "true");
    });

    it("shows error state", () => {
      render(<Select error="Selection required" options={mockOptions} />);
      expect(screen.getByText("Selection required")).toBeInTheDocument();
    });

    it("shows loading state", () => {
      render(<Select loading placeholder="Loading..." options={[]} />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("opens with Enter key", async () => {
      const user = userEvent.setup();
      render(<Select placeholder="Select" options={mockOptions} />);
      
      const trigger = screen.getByRole("combobox");
      trigger.focus();
      await user.keyboard("{Enter}");
      
      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
      });
    });

    it("navigates with arrow keys", async () => {
      const user = userEvent.setup();
      render(<Select placeholder="Select" options={mockOptions} />);
      
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");
      
      await waitFor(() => {
        expect(screen.getByText("Option 2")).toBeInTheDocument();
      });
    });

    it("closes with Escape key", async () => {
      const user = userEvent.setup();
      render(<Select placeholder="Select" options={mockOptions} />);
      
      await user.click(screen.getByText("Select"));
      await user.keyboard("{Escape}");
      
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has correct ARIA attributes", () => {
      render(<Select placeholder="Select" options={mockOptions} aria-label="Select option" />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-label", "Select option");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("updates aria-expanded when opened", async () => {
      const user = userEvent.setup();
      render(<Select placeholder="Select" options={mockOptions} />);
      
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Groups", () => {
    it("renders option groups", async () => {
      const groupedOptions = [
        { label: "Group 1", options: [{ value: "a", label: "A" }] },
        { label: "Group 2", options: [{ value: "b", label: "B" }] },
      ];
      
      const user = userEvent.setup();
      render(<Select placeholder="Select" options={groupedOptions} />);
      
      await user.click(screen.getByText("Select"));
      
      await waitFor(() => {
        expect(screen.getByText("Group 1")).toBeInTheDocument();
        expect(screen.getByText("Group 2")).toBeInTheDocument();
      });
    });
  });
});
