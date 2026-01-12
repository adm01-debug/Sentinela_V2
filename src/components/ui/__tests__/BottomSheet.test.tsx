import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomSheet } from "../BottomSheet";

describe("BottomSheet Component", () => {
  it("renders when open", () => {
    render(<BottomSheet open onClose={() => {}}>Content</BottomSheet>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<BottomSheet open={false} onClose={() => {}}>Content</BottomSheet>);
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("calls onClose when backdrop clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<BottomSheet open onClose={onClose}>Content</BottomSheet>);
    
    await user.click(screen.getByTestId("backdrop"));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders header", () => {
    render(<BottomSheet open onClose={() => {}} title="Sheet Title">Content</BottomSheet>);
    expect(screen.getByText("Sheet Title")).toBeInTheDocument();
  });

  it("renders drag handle", () => {
    render(<BottomSheet open onClose={() => {}} showDragHandle>Content</BottomSheet>);
    expect(screen.getByTestId("drag-handle")).toBeInTheDocument();
  });

  it("supports different snap points", () => {
    render(
      <BottomSheet open onClose={() => {}} snapPoints={[0.5, 1]} data-testid="sheet">
        Content
      </BottomSheet>
    );
    expect(screen.getByTestId("sheet")).toBeInTheDocument();
  });

  it("closes on escape key", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<BottomSheet open onClose={onClose}>Content</BottomSheet>);
    
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
