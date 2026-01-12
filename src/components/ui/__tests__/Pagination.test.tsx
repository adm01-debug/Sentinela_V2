import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "../Pagination";

describe("Pagination Component", () => {
  it("renders pagination items", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationPrevious /></PaginationItem>
          <PaginationItem><PaginationLink>1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink>2</PaginationLink></PaginationItem>
          <PaginationItem><PaginationNext /></PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows active state", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationLink isActive>1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink>2</PaginationLink></PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    expect(screen.getByText("1")).toHaveAttribute("aria-current", "page");
  });

  it("handles page click", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationLink onClick={handleClick}>1</PaginationLink></PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    await user.click(screen.getByText("1"));
    expect(handleClick).toHaveBeenCalled();
  });

  it("renders ellipsis", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationLink>1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationEllipsis /></PaginationItem>
          <PaginationItem><PaginationLink>10</PaginationLink></PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    expect(screen.getByText("More pages")).toBeInTheDocument();
  });

  it("disables prev/next when appropriate", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationPrevious aria-disabled="true" /></PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    
    expect(screen.getByText("Previous")).toHaveAttribute("aria-disabled", "true");
  });
});
