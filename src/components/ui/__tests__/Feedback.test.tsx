import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Feedback } from "../Feedback";

describe("Feedback Component", () => {
  it("renders feedback options", () => {
    render(<Feedback onSubmit={() => {}} />);
    expect(screen.getByRole("button", { name: /good|positive/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bad|negative/i })).toBeInTheDocument();
  });

  it("handles positive feedback", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<Feedback onSubmit={onSubmit} />);
    
    await user.click(screen.getByRole("button", { name: /good|positive/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ rating: "positive" }));
  });

  it("handles negative feedback", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<Feedback onSubmit={onSubmit} />);
    
    await user.click(screen.getByRole("button", { name: /bad|negative/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ rating: "negative" }));
  });

  it("shows comment field after selection", async () => {
    const user = userEvent.setup();
    render(<Feedback onSubmit={() => {}} showComment />);
    
    await user.click(screen.getByRole("button", { name: /good|positive/i }));
    expect(screen.getByPlaceholderText(/comment|feedback/i)).toBeInTheDocument();
  });

  it("submits with comment", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<Feedback onSubmit={onSubmit} showComment />);
    
    await user.click(screen.getByRole("button", { name: /good|positive/i }));
    await user.type(screen.getByPlaceholderText(/comment/i), "Great!");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ comment: "Great!" }));
  });

  it("shows thank you message after submit", async () => {
    const user = userEvent.setup();
    render(<Feedback onSubmit={() => {}} />);
    
    await user.click(screen.getByRole("button", { name: /good|positive/i }));
    expect(screen.getByText(/thank you/i)).toBeInTheDocument();
  });
});
