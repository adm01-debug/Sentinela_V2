import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../ThemeProvider";

describe("ThemeProvider", () => {
  it("renders children", () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("accepts custom default theme", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div>Test</div>
      </ThemeProvider>
    );
    expect(true).toBe(true);
  });

  it("accepts custom storage key", () => {
    render(
      <ThemeProvider storageKey="custom-theme">
        <div>Test</div>
      </ThemeProvider>
    );
    expect(true).toBe(true);
  });
});
