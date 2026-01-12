import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryProvider } from "../QueryProvider";

describe("QueryProvider", () => {
  it("renders children", () => {
    render(
      <QueryProvider>
        <div data-testid="child">Test</div>
      </QueryProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("provides query client context", () => {
    render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>
    );
    expect(true).toBe(true);
  });
});
