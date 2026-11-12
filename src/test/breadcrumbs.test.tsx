import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

function renderBreadcrumbs(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Breadcrumbs />
    </MemoryRouter>
  );
}

describe("Breadcrumbs Component", () => {
  it("hides on dashboard route", () => {
    const { container } = renderBreadcrumbs("/dashboard");
    expect(container.innerHTML).toBe("");
  });

  it("hides on root route", () => {
    const { container } = renderBreadcrumbs("/");
    expect(container.innerHTML).toBe("");
  });

  it("shows home link on single-segment routes like /employees", () => {
    renderBreadcrumbs("/employees");
    expect(screen.getByLabelText("breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Colaboradores")).toBeInTheDocument();
  });

  it("shows home link on single-segment routes like /alerts", () => {
    renderBreadcrumbs("/alerts");
    expect(screen.getByLabelText("breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Alerts")).toBeInTheDocument();
  });

  it("shows breadcrumbs for multi-segment routes", () => {
    renderBreadcrumbs("/admin/departments");
    expect(screen.getByLabelText("breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Departments")).toBeInTheDocument();
  });

  it("shows Home icon link", () => {
    renderBreadcrumbs("/admin/teams");
    const homeLink = screen.getByLabelText("breadcrumb").querySelector('a[href="/"]');
    expect(homeLink).toBeInTheDocument();
  });

  it("renders last crumb as non-link text", () => {
    renderBreadcrumbs("/admin/users");
    const lastCrumb = screen.getByText("Users");
    expect(lastCrumb.tagName).not.toBe("A");
    expect(lastCrumb).toHaveClass("font-medium");
  });

  it("renders intermediate crumbs as links", () => {
    renderBreadcrumbs("/admin/roles");
    const adminLink = screen.getByText("Admin");
    expect(adminLink.tagName).toBe("A");
  });

  it("handles unknown routes with capitalization", () => {
    renderBreadcrumbs("/admin/unknown-route");
    expect(screen.getByText("Unknown route")).toBeInTheDocument();
  });

  it("renders chevron separators", () => {
    const { container } = renderBreadcrumbs("/admin/audit");
    const chevrons = container.querySelectorAll("svg");
    expect(chevrons.length).toBeGreaterThan(0);
  });

  it("has proper aria-label", () => {
    renderBreadcrumbs("/admin/teams");
    expect(screen.getByLabelText("breadcrumb")).toBeInTheDocument();
  });

  it("accepts custom className", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/admin/teams"]}>
        <Breadcrumbs className="custom-class" />
      </MemoryRouter>
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});
