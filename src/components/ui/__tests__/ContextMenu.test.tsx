import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "../ContextMenu";

describe("ContextMenu Component", () => {
  it("opens on right click", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    
    await user.pointer({ keys: "[MouseRight]", target: screen.getByText("Right click me") });
    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  it("calls onSelect on item click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    
    render(
      <ContextMenu>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onSelect}>Select me</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    
    await user.pointer({ keys: "[MouseRight]", target: screen.getByText("Trigger") });
    await user.click(screen.getByText("Select me"));
    
    expect(onSelect).toHaveBeenCalled();
  });

  it("renders separator", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
          <ContextMenuSeparator data-testid="separator" />
          <ContextMenuItem>Item 2</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    
    await user.pointer({ keys: "[MouseRight]", target: screen.getByText("Trigger") });
    await waitFor(() => {
      expect(screen.getByTestId("separator")).toBeInTheDocument();
    });
  });

  it("supports submenu", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Trigger</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Sub item</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    );
    
    await user.pointer({ keys: "[MouseRight]", target: screen.getByText("Trigger") });
    await user.hover(screen.getByText("More"));
    await waitFor(() => {
      expect(screen.getByText("Sub item")).toBeInTheDocument();
    });
  });
});
