import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KeyboardShortcuts, useKeyboardShortcut } from "../KeyboardShortcuts";

describe("KeyboardShortcuts Component", () => {
  it("renders shortcut list", () => {
    const shortcuts = [
      { key: "Ctrl+S", description: "Save" },
      { key: "Ctrl+Z", description: "Undo" },
    ];
    
    render(<KeyboardShortcuts shortcuts={shortcuts} />);
    expect(screen.getByText("Ctrl+S")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("groups shortcuts by category", () => {
    const shortcuts = [
      { key: "Ctrl+S", description: "Save", category: "File" },
      { key: "Ctrl+C", description: "Copy", category: "Edit" },
    ];
    
    render(<KeyboardShortcuts shortcuts={shortcuts} grouped />);
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("triggers shortcut callback", () => {
    const onSave = vi.fn();
    const shortcuts = [{ key: "ctrl+s", description: "Save", handler: onSave }];
    
    render(<KeyboardShortcuts shortcuts={shortcuts} active />);
    
    fireEvent.keyDown(document, { key: "s", ctrlKey: true });
    expect(onSave).toHaveBeenCalled();
  });

  it("shows shortcut dialog", () => {
    render(<KeyboardShortcuts shortcuts={[]} showDialog />);
    fireEvent.keyDown(document, { key: "?", shiftKey: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders platform-specific keys", () => {
    const shortcuts = [{ key: "Meta+S", description: "Save" }];
    render(<KeyboardShortcuts shortcuts={shortcuts} />);
    expect(screen.getByText(/⌘|Cmd|Meta/)).toBeInTheDocument();
  });
});
