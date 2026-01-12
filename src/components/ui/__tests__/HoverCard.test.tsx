import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../HoverCard";

describe("HoverCard Component", () => {
  it("shows content on hover", async () => {
    const user = userEvent.setup();
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Card content</HoverCardContent>
      </HoverCard>
    );
    
    await user.hover(screen.getByText("Hover me"));
    await waitFor(() => {
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });
  });

  it("hides content on unhover", async () => {
    const user = userEvent.setup();
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Card content</HoverCardContent>
      </HoverCard>
    );
    
    await user.hover(screen.getByText("Hover me"));
    await user.unhover(screen.getByText("Hover me"));
    await waitFor(() => {
      expect(screen.queryByText("Card content")).not.toBeInTheDocument();
    });
  });

  it("supports open delay", async () => {
    const user = userEvent.setup();
    render(
      <HoverCard openDelay={500}>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Delayed content</HoverCardContent>
      </HoverCard>
    );
    
    await user.hover(screen.getByText("Hover me"));
    expect(screen.queryByText("Delayed content")).not.toBeInTheDocument();
  });

  it("renders with custom alignment", async () => {
    const user = userEvent.setup();
    render(
      <HoverCard>
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardContent align="start" data-testid="content">Content</HoverCardContent>
      </HoverCard>
    );
    
    await user.hover(screen.getByText("Trigger"));
    await waitFor(() => {
      expect(screen.getByTestId("content")).toHaveAttribute("data-align", "start");
    });
  });
});
