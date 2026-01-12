import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Code } from "../Code";

describe("Code Component", () => {
  it("renders code block", () => {
    render(<Code>const x = 1;</Code>);
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });

  it("renders inline code", () => {
    render(<Code inline>variable</Code>);
    expect(screen.getByText("variable")).toHaveClass("inline");
  });

  it("applies syntax highlighting", () => {
    render(<Code language="javascript">const x = 1;</Code>);
    expect(screen.getByText("const x = 1;").closest("pre")).toHaveClass("language-javascript");
  });

  it("shows line numbers", () => {
    render(<Code showLineNumbers>{`line 1
line 2`}</Code>);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders copy button", async () => {
    const user = userEvent.setup();
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
    
    render(<Code copyable>copy me</Code>);
    
    const copyButton = screen.getByRole("button", { name: /copy/i });
    await user.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("copy me");
  });

  it("highlights specific lines", () => {
    render(<Code highlightLines={[2]}>{`line 1
line 2
line 3`}</Code>);
    expect(screen.getByText("line 2").closest(".line")).toHaveClass("highlighted");
  });

  it("supports custom theme", () => {
    render(<Code theme="dark" data-testid="code">code</Code>);
    expect(screen.getByTestId("code")).toHaveClass("theme-dark");
  });
});
