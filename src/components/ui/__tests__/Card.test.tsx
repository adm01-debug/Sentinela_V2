import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../Card";

describe("Card Component", () => {
  describe("Card", () => {
    it("renders children", () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<Card className="custom-class">Content</Card>);
      expect(screen.getByText("Content").parentElement).toHaveClass("custom-class");
    });

    it("renders with default styles", () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("rounded-lg", "border", "bg-card");
    });
  });

  describe("CardHeader", () => {
    it("renders header content", () => {
      render(
        <Card>
          <CardHeader>Header Content</CardHeader>
        </Card>
      );
      expect(screen.getByText("Header Content")).toBeInTheDocument();
    });

    it("applies spacing styles", () => {
      render(
        <Card>
          <CardHeader data-testid="header">Header</CardHeader>
        </Card>
      );
      expect(screen.getByTestId("header")).toHaveClass("flex", "flex-col", "space-y-1.5", "p-6");
    });
  });

  describe("CardTitle", () => {
    it("renders title text", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText("Card Title")).toBeInTheDocument();
    });

    it("applies heading styles", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle data-testid="title">Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByTestId("title")).toHaveClass("text-2xl", "font-semibold");
    });
  });

  describe("CardDescription", () => {
    it("renders description text", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText("Card description text")).toBeInTheDocument();
    });

    it("applies muted text styles", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription data-testid="desc">Description</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByTestId("desc")).toHaveClass("text-sm", "text-muted-foreground");
    });
  });

  describe("CardContent", () => {
    it("renders content", () => {
      render(
        <Card>
          <CardContent>Main content here</CardContent>
        </Card>
      );
      expect(screen.getByText("Main content here")).toBeInTheDocument();
    });

    it("applies padding styles", () => {
      render(
        <Card>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );
      expect(screen.getByTestId("content")).toHaveClass("p-6", "pt-0");
    });
  });

  describe("CardFooter", () => {
    it("renders footer content", () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );
      expect(screen.getByText("Footer content")).toBeInTheDocument();
    });

    it("applies flex layout", () => {
      render(
        <Card>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );
      expect(screen.getByTestId("footer")).toHaveClass("flex", "items-center", "p-6", "pt-0");
    });
  });

  describe("Full Card Composition", () => {
    it("renders complete card structure", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>A complete card example</CardDescription>
          </CardHeader>
          <CardContent>Main content goes here</CardContent>
          <CardFooter>Footer with actions</CardFooter>
        </Card>
      );

      expect(screen.getByText("Complete Card")).toBeInTheDocument();
      expect(screen.getByText("A complete card example")).toBeInTheDocument();
      expect(screen.getByText("Main content goes here")).toBeInTheDocument();
      expect(screen.getByText("Footer with actions")).toBeInTheDocument();
    });

    it("supports nested components", () => {
      render(
        <Card>
          <CardContent>
            <button>Action Button</button>
          </CardContent>
        </Card>
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("supports interactive variant", () => {
      render(<Card variant="interactive" data-testid="card">Interactive</Card>);
      expect(screen.getByTestId("card")).toHaveClass("cursor-pointer", "hover:shadow-md");
    });

    it("supports outlined variant", () => {
      render(<Card variant="outlined" data-testid="card">Outlined</Card>);
      expect(screen.getByTestId("card")).toHaveClass("border-2");
    });
  });
});
