import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchAutocomplete } from "../SearchAutocomplete";

const suggestions = [
  { id: 1, label: "Apple" },
  { id: 2, label: "Banana" },
  { id: 3, label: "Cherry" },
];

describe("SearchAutocomplete Component", () => {
  it("renders search input", () => {
    render(<SearchAutocomplete suggestions={suggestions} placeholder="Search..." />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("shows suggestions on input", async () => {
    const user = userEvent.setup();
    render(<SearchAutocomplete suggestions={suggestions} />);
    
    await user.type(screen.getByRole("combobox"), "a");
    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Banana")).toBeInTheDocument();
    });
  });

  it("filters suggestions", async () => {
    const user = userEvent.setup();
    render(<SearchAutocomplete suggestions={suggestions} />);
    
    await user.type(screen.getByRole("combobox"), "ban");
    await waitFor(() => {
      expect(screen.getByText("Banana")).toBeInTheDocument();
      expect(screen.queryByText("Apple")).not.toBeInTheDocument();
    });
  });

  it("selects suggestion on click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    
    render(<SearchAutocomplete suggestions={suggestions} onSelect={onSelect} />);
    
    await user.type(screen.getByRole("combobox"), "a");
    await user.click(screen.getByText("Apple"));
    
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: "Apple" }));
  });

  it("supports async loading", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn().mockResolvedValue(suggestions);
    
    render(<SearchAutocomplete onSearch={onSearch} async />);
    
    await user.type(screen.getByRole("combobox"), "test");
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith("test");
    });
  });

  it("shows loading state", async () => {
    const user = userEvent.setup();
    render(<SearchAutocomplete suggestions={suggestions} loading />);
    
    await user.type(screen.getByRole("combobox"), "a");
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("shows no results message", async () => {
    const user = userEvent.setup();
    render(<SearchAutocomplete suggestions={[]} noResultsMessage="No matches found" />);
    
    await user.type(screen.getByRole("combobox"), "xyz");
    await waitFor(() => {
      expect(screen.getByText("No matches found")).toBeInTheDocument();
    });
  });
});
