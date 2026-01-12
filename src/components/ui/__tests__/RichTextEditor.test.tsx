import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextEditor } from "../RichTextEditor";

describe("RichTextEditor Component", () => {
  it("renders editor", () => {
    render(<RichTextEditor />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders toolbar", () => {
    render(<RichTextEditor />);
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });

  it("applies bold formatting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<RichTextEditor onChange={onChange} />);
    
    await user.click(screen.getByRole("button", { name: /bold/i }));
    await user.type(screen.getByRole("textbox"), "Bold text");
    
    expect(onChange).toHaveBeenCalled();
  });

  it("applies italic formatting", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor />);
    
    await user.click(screen.getByRole("button", { name: /italic/i }));
  });

  it("supports initial value", () => {
    render(<RichTextEditor defaultValue="<p>Initial content</p>" />);
    expect(screen.getByText("Initial content")).toBeInTheDocument();
  });

  it("handles placeholder", () => {
    render(<RichTextEditor placeholder="Start typing..." />);
    expect(screen.getByPlaceholderText("Start typing...")).toBeInTheDocument();
  });

  it("supports read-only mode", () => {
    render(<RichTextEditor readOnly defaultValue="<p>Read only</p>" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("contenteditable", "false");
  });

  it("inserts link", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor />);
    
    await user.click(screen.getByRole("button", { name: /link/i }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
