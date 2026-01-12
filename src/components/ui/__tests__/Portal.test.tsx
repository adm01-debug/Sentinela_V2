import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Portal } from "../Portal";

describe("Portal Component", () => {
  it("renders content in document body", () => {
    render(<Portal><div data-testid="portal-content">Portaled</div></Portal>);
    expect(screen.getByTestId("portal-content")).toBeInTheDocument();
    expect(document.body.contains(screen.getByTestId("portal-content"))).toBe(true);
  });

  it("renders content in custom container", () => {
    const container = document.createElement("div");
    container.id = "custom-portal";
    document.body.appendChild(container);
    
    render(<Portal container={container}><div data-testid="content">Content</div></Portal>);
    expect(container.contains(screen.getByTestId("content"))).toBe(true);
    
    document.body.removeChild(container);
  });

  it("removes content on unmount", () => {
    const { unmount } = render(<Portal><div data-testid="portal-content">Portaled</div></Portal>);
    expect(screen.getByTestId("portal-content")).toBeInTheDocument();
    
    unmount();
    expect(screen.queryByTestId("portal-content")).not.toBeInTheDocument();
  });

  it("supports disabled state", () => {
    render(
      <div data-testid="parent">
        <Portal disabled><div data-testid="content">Not portaled</div></Portal>
      </div>
    );
    expect(screen.getByTestId("parent").contains(screen.getByTestId("content"))).toBe(true);
  });
});
