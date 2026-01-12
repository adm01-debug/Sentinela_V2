import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InfoCard } from "../InfoCard";

describe("InfoCard Component", () => {
  it("renders title and description", () => {
    render(<InfoCard title="Info" description="Description text" />);
    expect(screen.getByText("Info")).toBeInTheDocument();
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("renders icon", () => {
    render(<InfoCard title="Info" icon={<span data-testid="icon">i</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders different variants", () => {
    const { rerender } = render(<InfoCard title="Info" variant="info" data-testid="card" />);
    expect(screen.getByTestId("card")).toHaveClass("bg-blue");
    
    rerender(<InfoCard title="Warning" variant="warning" data-testid="card" />);
    expect(screen.getByTestId("card")).toHaveClass("bg-yellow");
    
    rerender(<InfoCard title="Error" variant="error" data-testid="card" />);
    expect(screen.getByTestId("card")).toHaveClass("bg-red");
    
    rerender(<InfoCard title="Success" variant="success" data-testid="card" />);
    expect(screen.getByTestId("card")).toHaveClass("bg-green");
  });

  it("renders action button", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    
    render(<InfoCard title="Info" action={{ label: "Learn more", onClick: onAction }} />);
    
    await user.click(screen.getByText("Learn more"));
    expect(onAction).toHaveBeenCalled();
  });

  it("supports dismissable", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    
    render(<InfoCard title="Info" dismissable onDismiss={onDismiss} />);
    
    await user.click(screen.getByRole("button", { name: /close|dismiss/i }));
    expect(onDismiss).toHaveBeenCalled();
  });
});
