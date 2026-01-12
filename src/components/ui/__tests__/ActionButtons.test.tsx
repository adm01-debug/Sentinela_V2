import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionButtons } from "../ActionButtons";

describe("ActionButtons Component", () => {
  it("renders primary and secondary buttons", () => {
    render(
      <ActionButtons
        primaryLabel="Save"
        secondaryLabel="Cancel"
        onPrimary={() => {}}
        onSecondary={() => {}}
      />
    );
    
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("handles primary click", async () => {
    const user = userEvent.setup();
    const onPrimary = vi.fn();
    
    render(<ActionButtons primaryLabel="Save" onPrimary={onPrimary} />);
    
    await user.click(screen.getByText("Save"));
    expect(onPrimary).toHaveBeenCalled();
  });

  it("handles secondary click", async () => {
    const user = userEvent.setup();
    const onSecondary = vi.fn();
    
    render(
      <ActionButtons
        primaryLabel="Save"
        secondaryLabel="Cancel"
        onPrimary={() => {}}
        onSecondary={onSecondary}
      />
    );
    
    await user.click(screen.getByText("Cancel"));
    expect(onSecondary).toHaveBeenCalled();
  });

  it("shows loading state", () => {
    render(<ActionButtons primaryLabel="Save" onPrimary={() => {}} loading />);
    expect(screen.getByText("Save").closest("button")).toHaveAttribute("aria-busy", "true");
  });

  it("disables buttons when disabled", () => {
    render(
      <ActionButtons
        primaryLabel="Save"
        secondaryLabel="Cancel"
        onPrimary={() => {}}
        onSecondary={() => {}}
        disabled
      />
    );
    
    expect(screen.getByText("Save")).toBeDisabled();
    expect(screen.getByText("Cancel")).toBeDisabled();
  });

  it("supports different alignments", () => {
    const { rerender } = render(
      <ActionButtons primaryLabel="Save" onPrimary={() => {}} align="left" data-testid="actions" />
    );
    expect(screen.getByTestId("actions")).toHaveClass("justify-start");
    
    rerender(<ActionButtons primaryLabel="Save" onPrimary={() => {}} align="right" data-testid="actions" />);
    expect(screen.getByTestId("actions")).toHaveClass("justify-end");
  });
});
