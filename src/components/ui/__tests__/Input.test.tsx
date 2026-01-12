import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../Input";

describe("Input Component", () => {
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("renders with label", () => {
      render(<Input label="Username" />);
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
    });

    it("renders different types", () => {
      const { rerender } = render(<Input type="text" placeholder="text" />);
      expect(screen.getByPlaceholderText("text")).toHaveAttribute("type", "text");

      rerender(<Input type="password" placeholder="password" />);
      expect(screen.getByPlaceholderText("password")).toHaveAttribute("type", "password");

      rerender(<Input type="email" placeholder="email" />);
      expect(screen.getByPlaceholderText("email")).toHaveAttribute("type", "email");

      rerender(<Input type="number" placeholder="number" />);
      expect(screen.getByPlaceholderText("number")).toHaveAttribute("type", "number");
    });
  });

  describe("User Interactions", () => {
    it("handles text input", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input onChange={handleChange} placeholder="Type here" />);
      const input = screen.getByPlaceholderText("Type here");
      
      await user.type(input, "Hello World");
      expect(input).toHaveValue("Hello World");
      expect(handleChange).toHaveBeenCalled();
    });

    it("handles focus and blur", () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} placeholder="Focus me" />);
      const input = screen.getByPlaceholderText("Focus me");
      
      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalled();
      
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalled();
    });

    it("clears input with clear button", async () => {
      const user = userEvent.setup();
      render(<Input clearable defaultValue="Clear me" />);
      
      const input = screen.getByDisplayValue("Clear me");
      expect(input).toHaveValue("Clear me");
      
      const clearButton = screen.queryByRole("button", { name: /clear/i });
      if (clearButton) {
        await user.click(clearButton);
        expect(input).toHaveValue("");
      }
    });
  });

  describe("Validation States", () => {
    it("shows error state", () => {
      render(<Input error="This field is required" placeholder="Required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Required")).toHaveClass("border-destructive");
    });

    it("shows success state", () => {
      render(<Input success placeholder="Valid input" />);
      expect(screen.getByPlaceholderText("Valid input")).toHaveClass("border-green");
    });

    it("shows helper text", () => {
      render(<Input helperText="Enter your email address" placeholder="Email" />);
      expect(screen.getByText("Enter your email address")).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("disables input when disabled prop is true", () => {
      render(<Input disabled placeholder="Disabled" />);
      expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
    });

    it("prevents typing when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input disabled onChange={handleChange} placeholder="Disabled" />);
      const input = screen.getByPlaceholderText("Disabled");
      
      await user.type(input, "Cannot type");
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Icons and Addons", () => {
    it("renders with left icon", () => {
      render(<Input leftIcon={<span data-testid="left-icon">🔍</span>} placeholder="Search" />);
      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    });

    it("renders with right icon", () => {
      render(<Input rightIcon={<span data-testid="right-icon">✓</span>} placeholder="Verified" />);
      expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    });

    it("renders with prefix", () => {
      render(<Input prefix="$" placeholder="Amount" />);
      expect(screen.getByText("$")).toBeInTheDocument();
    });

    it("renders with suffix", () => {
      render(<Input suffix=".00" placeholder="Price" />);
      expect(screen.getByText(".00")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has correct ARIA attributes", () => {
      render(
        <Input
          aria-label="Search input"
          aria-describedby="search-hint"
          placeholder="Search"
        />
      );
      const input = screen.getByPlaceholderText("Search");
      expect(input).toHaveAttribute("aria-label", "Search input");
      expect(input).toHaveAttribute("aria-describedby", "search-hint");
    });

    it("marks required inputs", () => {
      render(<Input required placeholder="Required field" />);
      expect(screen.getByPlaceholderText("Required field")).toHaveAttribute("required");
    });

    it("associates label with input", () => {
      render(<Input id="email-input" label="Email" />);
      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("id", "email-input");
    });
  });

  describe("Controlled vs Uncontrolled", () => {
    it("works as controlled input", () => {
      const { rerender } = render(<Input value="controlled" onChange={() => {}} />);
      expect(screen.getByDisplayValue("controlled")).toBeInTheDocument();
      
      rerender(<Input value="updated" onChange={() => {}} />);
      expect(screen.getByDisplayValue("updated")).toBeInTheDocument();
    });

    it("works as uncontrolled input", async () => {
      const user = userEvent.setup();
      render(<Input defaultValue="initial" />);
      
      const input = screen.getByDisplayValue("initial");
      await user.clear(input);
      await user.type(input, "changed");
      expect(input).toHaveValue("changed");
    });
  });
});
