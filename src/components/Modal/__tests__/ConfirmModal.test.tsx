import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmModal } from "../ConfirmModal";

describe("ConfirmModal", () => {
  it("renders title", () => {
    render(<ConfirmModal open title="Confirm?" onOpenChange={() => {}} onConfirm={() => {}} />);
    expect(screen.getByText("Confirm?")).toBeInTheDocument();
  });

  it("calls onConfirm", () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal open title="Test" onOpenChange={() => {}} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("shows loading state", () => {
    render(<ConfirmModal open title="Test" onOpenChange={() => {}} onConfirm={() => {}} isLoading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
