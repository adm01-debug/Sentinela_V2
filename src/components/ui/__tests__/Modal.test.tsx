import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../Modal";

describe("Modal Component", () => {
  describe("Visibility", () => {
    it("renders when open is true", () => {
      render(<Modal open={true} onClose={() => {}}>Modal Content</Modal>);
      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      render(<Modal open={false} onClose={() => {}}>Modal Content</Modal>);
      expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
    });

    it("shows/hides based on open prop changes", () => {
      const { rerender } = render(<Modal open={false} onClose={() => {}}>Content</Modal>);
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
      
      rerender(<Modal open={true} onClose={() => {}}>Content</Modal>);
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  describe("Closing Behavior", () => {
    it("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      
      render(<Modal open={true} onClose={handleClose}>Content</Modal>);
      
      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when clicking overlay", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      
      render(<Modal open={true} onClose={handleClose} closeOnOverlayClick>Content</Modal>);
      
      const overlay = screen.getByTestId("modal-overlay");
      await user.click(overlay);
      
      expect(handleClose).toHaveBeenCalled();
    });

    it("does not close when clicking inside modal", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      
      render(<Modal open={true} onClose={handleClose} closeOnOverlayClick>Content</Modal>);
      
      await user.click(screen.getByText("Content"));
      
      expect(handleClose).not.toHaveBeenCalled();
    });

    it("closes on Escape key press", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      
      render(<Modal open={true} onClose={handleClose}>Content</Modal>);
      
      await user.keyboard("{Escape}");
      
      expect(handleClose).toHaveBeenCalled();
    });

    it("respects closeOnEscape prop", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      
      render(<Modal open={true} onClose={handleClose} closeOnEscape={false}>Content</Modal>);
      
      await user.keyboard("{Escape}");
      
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe("Header and Footer", () => {
    it("renders title", () => {
      render(<Modal open={true} onClose={() => {}} title="Modal Title">Content</Modal>);
      expect(screen.getByText("Modal Title")).toBeInTheDocument();
    });

    it("renders footer", () => {
      render(
        <Modal open={true} onClose={() => {}} footer={<button>Save</button>}>
          Content
        </Modal>
      );
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("hides close button when showCloseButton is false", () => {
      render(<Modal open={true} onClose={() => {}} showCloseButton={false}>Content</Modal>);
      expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("renders small size", () => {
      render(<Modal open={true} onClose={() => {}} size="sm" data-testid="modal">Content</Modal>);
      expect(screen.getByTestId("modal")).toHaveClass("max-w-sm");
    });

    it("renders medium size (default)", () => {
      render(<Modal open={true} onClose={() => {}} data-testid="modal">Content</Modal>);
      expect(screen.getByTestId("modal")).toHaveClass("max-w-md");
    });

    it("renders large size", () => {
      render(<Modal open={true} onClose={() => {}} size="lg" data-testid="modal">Content</Modal>);
      expect(screen.getByTestId("modal")).toHaveClass("max-w-lg");
    });

    it("renders full size", () => {
      render(<Modal open={true} onClose={() => {}} size="full" data-testid="modal">Content</Modal>);
      expect(screen.getByTestId("modal")).toHaveClass("max-w-full");
    });
  });

  describe("Accessibility", () => {
    it("has correct ARIA attributes", () => {
      render(<Modal open={true} onClose={() => {}} title="Accessible Modal">Content</Modal>);
      
      const modal = screen.getByRole("dialog");
      expect(modal).toHaveAttribute("aria-modal", "true");
      expect(modal).toHaveAttribute("aria-labelledby");
    });

    it("traps focus inside modal", async () => {
      const user = userEvent.setup();
      render(
        <Modal open={true} onClose={() => {}}>
          <input data-testid="first" />
          <input data-testid="second" />
        </Modal>
      );
      
      const firstInput = screen.getByTestId("first");
      const secondInput = screen.getByTestId("second");
      
      firstInput.focus();
      await user.tab();
      expect(secondInput).toHaveFocus();
    });

    it("returns focus to trigger on close", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      
      const { rerender } = render(
        <>
          <button data-testid="trigger">Open</button>
          <Modal open={true} onClose={handleClose}>Content</Modal>
        </>
      );
      
      // Simulate closing
      rerender(
        <>
          <button data-testid="trigger">Open</button>
          <Modal open={false} onClose={handleClose}>Content</Modal>
        </>
      );
      
      // Focus should return to trigger
    });
  });

  describe("Animation", () => {
    it("applies enter animation classes", () => {
      render(<Modal open={true} onClose={() => {}} data-testid="modal">Content</Modal>);
      expect(screen.getByTestId("modal")).toHaveClass("animate-in");
    });
  });

  describe("Portal", () => {
    it("renders in portal by default", () => {
      render(<Modal open={true} onClose={() => {}}>Content</Modal>);
      expect(document.body.querySelector("[role=dialog]")).toBeInTheDocument();
    });
  });
});
