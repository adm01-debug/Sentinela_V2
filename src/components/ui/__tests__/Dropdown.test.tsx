import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "../Dropdown";

describe("Dropdown Component", () => {
  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Open Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Item 1</DropdownItem>
          <DropdownItem>Item 2</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    
    await user.click(screen.getByText("Open Menu"));
    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
  });

  it("closes on item selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    
    render(
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownItem onSelect={onSelect}>Select Me</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    
    await user.click(screen.getByText("Menu"));
    await user.click(screen.getByText("Select Me"));
    
    expect(onSelect).toHaveBeenCalled();
  });

  it("renders separator", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Item 1</DropdownItem>
          <DropdownSeparator data-testid="separator" />
          <DropdownItem>Item 2</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    
    await user.click(screen.getByText("Menu"));
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownItem>First</DropdownItem>
          <DropdownItem>Second</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    
    await user.click(screen.getByText("Menu"));
    await user.keyboard("{ArrowDown}");
    
    expect(screen.getByText("First")).toHaveFocus();
  });

  it("disables items correctly", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    
    render(
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownItem disabled onSelect={onSelect}>Disabled</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    
    await user.click(screen.getByText("Menu"));
    await user.click(screen.getByText("Disabled"));
    
    expect(onSelect).not.toHaveBeenCalled();
  });
});
