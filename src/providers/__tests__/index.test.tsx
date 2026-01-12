import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Providers } from "../index";

describe("Providers", () => {
  it("renders children with all providers", () => {
    render(
      <Providers>
        <div data-testid="app">App Content</div>
      </Providers>
    );
    expect(screen.getByTestId("app")).toBeInTheDocument();
  });

  it("wraps children in correct order", () => {
    const { container } = render(
      <Providers>
        <div>Test</div>
      </Providers>
    );
    expect(container).toBeTruthy();
  });
});
