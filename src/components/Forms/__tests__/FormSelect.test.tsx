import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormSelect } from "../FormSelect";

const options = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
];

describe("FormSelect", () => {
  it("renders label", () => {
    render(<FormSelect name="test" label="Test Label" options={options} />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("shows required indicator", () => {
    render(<FormSelect name="test" label="Test" options={options} required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<FormSelect name="test" label="Test" options={options} error="Error" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("shows placeholder", () => {
    render(<FormSelect name="test" label="Test" options={options} placeholder="Choose" />);
    expect(screen.getByText("Choose")).toBeInTheDocument();
  });
});
