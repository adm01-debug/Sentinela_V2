import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tag } from "../Tag";

describe("Tag Component", () => {
  it("renders tag with text", () => {
    render(<Tag>Label</Tag>);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("renders different colors", () => {
    const colors = ["gray", "red", "green", "blue", "yellow", "purple"];
    colors.forEach(color => {
      const { unmount } = render(<Tag color={color} data-testid="tag">{color}</Tag>);
      expect(screen.getByTestId("tag")).toHaveClass(`bg-${color}`);
      unmount();
    });
  });

  it("renders closable tag", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Tag closable onClose={onClose}>Closable</Tag>);
    
    await user.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders with icon", () => {
    render(<Tag icon={<span data-testid="icon">★</span>}>Starred</Tag>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders bordered variant", () => {
    render(<Tag bordered data-testid="tag">Bordered</Tag>);
    expect(screen.getByTestId("tag")).toHaveClass("border");
  });

  it("renders as link when href provided", () => {
    render(<Tag href="/tags/label">Link Tag</Tag>);
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
