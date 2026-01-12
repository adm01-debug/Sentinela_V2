import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "../Checkbox";

describe("Checkbox Component", () => {
  describe("Rendering", () => {
    it("renders unchecked by default", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("renders with label", () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByLabelText("Accept terms")).toBeInTheDocument();
    });

    it("renders checked when defaultChecked", () => {
      render(<Checkbox defaultChecked />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  describe("User Interactions", () => {
    it("toggles on click", async () => {
      const user = userEvent.setup();
      render(<Checkbox />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
      
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("calls onChange when toggled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Checkbox onCheckedChange={handleChange} />);
      await user.click(screen.getByRole("checkbox"));
      
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("toggles when clicking label", async () => {
      const user = userEvent.setup();
      render(<Checkbox label="Click me" />);
      
      await user.click(screen.getByText("Click me"));
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  describe("Controlled Mode", () => {
    it("respects controlled checked state", () => {
      const { rerender } = render(<Checkbox checked={false} onCheckedChange={() => {}} />);
      expect(screen.getByRole("checkbox")).not.toBeChecked();
      
      rerender(<Checkbox checked={true} onCheckedChange={() => {}} />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  describe("Disabled State", () => {
    it("is disabled when disabled prop is true", () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("does not toggle when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Checkbox disabled onCheckedChange={handleChange} />);
      await user.click(screen.getByRole("checkbox"));
      
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Indeterminate State", () => {
    it("shows indeterminate state", () => {
      render(<Checkbox checked="indeterminate" onCheckedChange={() => {}} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-state", "indeterminate");
    });
  });

  describe("Accessibility", () => {
    it("has correct ARIA attributes", () => {
      render(<Checkbox aria-label="Accept" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("aria-label", "Accept");
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<Checkbox />);
      
      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();
      await user.keyboard(" ");
      
      expect(checkbox).toBeChecked();
    });

    it("associates with label via id", () => {
      render(<Checkbox id="terms" label="Accept terms" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("id", "terms");
    });
  });

  describe("Styling", () => {
    it("applies custom className", () => {
      render(<Checkbox className="custom-checkbox" />);
      expect(screen.getByRole("checkbox")).toHaveClass("custom-checkbox");
    });

    it("applies error styles", () => {
      render(<Checkbox error />);
      expect(screen.getByRole("checkbox")).toHaveClass("border-destructive");
    });
  });

  describe("Form Integration", () => {
    it("supports name attribute", () => {
      render(<Checkbox name="agreement" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("name", "agreement");
    });

    it("supports value attribute", () => {
      render(<Checkbox value="accepted" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("value", "accepted");
    });

    it("supports required attribute", () => {
      render(<Checkbox required />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("aria-required", "true");
    });
  });
});
