import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Stepper, Step } from "../Stepper";

describe("Stepper Component", () => {
  it("renders steps", () => {
    render(
      <Stepper activeStep={0}>
        <Step title="Step 1" />
        <Step title="Step 2" />
        <Step title="Step 3" />
      </Stepper>
    );
    
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  it("shows active step", () => {
    render(
      <Stepper activeStep={1}>
        <Step title="Step 1" />
        <Step title="Step 2" />
      </Stepper>
    );
    
    expect(screen.getByText("Step 2").closest("[data-active]")).toHaveAttribute("data-active", "true");
  });

  it("shows completed steps", () => {
    render(
      <Stepper activeStep={2}>
        <Step title="Step 1" />
        <Step title="Step 2" />
        <Step title="Step 3" />
      </Stepper>
    );
    
    expect(screen.getByText("Step 1").closest("[data-completed]")).toHaveAttribute("data-completed", "true");
    expect(screen.getByText("Step 2").closest("[data-completed]")).toHaveAttribute("data-completed", "true");
  });

  it("renders descriptions", () => {
    render(
      <Stepper activeStep={0}>
        <Step title="Step 1" description="First step description" />
      </Stepper>
    );
    
    expect(screen.getByText("First step description")).toBeInTheDocument();
  });

  it("handles step click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(
      <Stepper activeStep={0} onChange={onChange}>
        <Step title="Step 1" />
        <Step title="Step 2" />
      </Stepper>
    );
    
    await user.click(screen.getByText("Step 2"));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("renders vertical orientation", () => {
    render(
      <Stepper activeStep={0} orientation="vertical" data-testid="stepper">
        <Step title="Step 1" />
      </Stepper>
    );
    
    expect(screen.getByTestId("stepper")).toHaveClass("flex-col");
  });

  it("shows error state", () => {
    render(
      <Stepper activeStep={1}>
        <Step title="Step 1" status="error" />
      </Stepper>
    );
    
    expect(screen.getByText("Step 1").closest("[data-status]")).toHaveAttribute("data-status", "error");
  });
});
