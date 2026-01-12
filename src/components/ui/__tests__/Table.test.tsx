import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from "../Table";

describe("Table Component", () => {
  it("renders basic table structure", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
  });

  it("renders caption", () => {
    render(
      <Table>
        <TableCaption>User List</TableCaption>
        <TableBody>
          <TableRow><TableCell>Data</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText("User List")).toBeInTheDocument();
  });

  it("renders footer", () => {
    render(
      <Table>
        <TableBody>
          <TableRow><TableCell>Data</TableCell></TableRow>
        </TableBody>
        <TableFooter>
          <TableRow><TableCell>Total</TableCell></TableRow>
        </TableFooter>
      </Table>
    );
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("applies hover styles to rows", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="row">
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId("row")).toHaveClass("hover:bg-muted/50");
  });

  it("supports custom className", () => {
    render(<Table className="custom-table" data-testid="table"><TableBody><TableRow><TableCell>X</TableCell></TableRow></TableBody></Table>);
    expect(screen.getByTestId("table")).toHaveClass("custom-table");
  });
});
