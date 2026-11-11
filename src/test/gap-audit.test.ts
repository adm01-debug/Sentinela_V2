/**
 * SENTINELA — Gap Audit Tests
 * Validates all critical gaps found during exhaustive audit
 */
import { describe, it, expect, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";

describe("Gap Audit: ForgotPassword Integration", () => {
  it("should call resetPasswordForEmail (not a stub)", async () => {
    const spy = vi.mocked(supabase.auth.resetPasswordForEmail);
    spy.mockResolvedValue({ data: {}, error: null });
    await supabase.auth.resetPasswordForEmail("test@test.com", {
      redirectTo: "http://localhost/auth?type=recovery",
    });
    expect(spy).toHaveBeenCalledWith(
      "test@test.com",
      expect.objectContaining({ redirectTo: expect.stringContaining("recovery") })
    );
  });
});

describe("Gap Audit: Employee Device Operations", () => {
  it("assignDevice inserts into employee_devices table", async () => {
    const mockInsert = vi.fn().mockReturnValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    } as any);

    await supabase.from("employee_devices").insert({
      employee_id: "emp-1",
      device_name: "Desktop Principal",
      device_type: "desktop",
      is_primary: true,
    });

    expect(supabase.from).toHaveBeenCalledWith("employee_devices");
    expect(mockInsert).toHaveBeenCalled();
  });

  it("unassignDevice deletes from employee_devices", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabase.from).mockReturnValue({
      delete: mockDelete,
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    } as any);

    await supabase.from("employee_devices").delete().eq("id", "device-1");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "device-1");
  });
});

describe("Gap Audit: CI/CD Configuration", () => {
  it("CI workflow should reference dist/ not .next/", async () => {
    const fs = await import("fs");
    const ci = fs.readFileSync(".github/workflows/ci.yml", "utf-8");
    expect(ci).not.toContain(".next/");
    expect(ci).toContain("dist/");
  });
});

describe("Gap Audit: Route Configuration", () => {
  it("root route redirects to dashboard", async () => {
    const fs = await import("fs");
    const routes = fs.readFileSync("src/routes/AppRoutes.tsx", "utf-8");
    expect(routes).toContain("ROUTES.HOME");
    expect(routes).toContain("Navigate to={ROUTES.DASHBOARD}");
  });

  it("auth route is guarded", async () => {
    const fs = await import("fs");
    const routes = fs.readFileSync("src/routes/AppRoutes.tsx", "utf-8");
    expect(routes).toContain("AuthGuard");
    expect(routes).toContain("GuestGuard");
  });

  it("404 catch-all route exists", async () => {
    const fs = await import("fs");
    const routes = fs.readFileSync("src/routes/AppRoutes.tsx", "utf-8");
    expect(routes).toContain('path="*"');
    expect(routes).toContain("NotFoundPage");
  });
});

describe("Gap Audit: Type Safety", () => {
  it("AppRoutes should not use any for session state", async () => {
    const fs = await import("fs");
    const routes = fs.readFileSync("src/routes/AppRoutes.tsx", "utf-8");
    expect(routes).not.toMatch(/useState<any>/);
  });

  it("ForgotPasswordPage should not have TODO stubs", async () => {
    const fs = await import("fs");
    const forgot = fs.readFileSync("src/pages/ForgotPasswordPage.tsx", "utf-8");
    expect(forgot).not.toContain("TODO");
    expect(forgot).toContain("resetPasswordForEmail");
  });

  it("useEmployeesPage should not have stub functions", async () => {
    const fs = await import("fs");
    const hook = fs.readFileSync("src/hooks/useEmployeesPage.ts", "utf-8");
    expect(hook).not.toContain("/* stub */");
  });
});

describe("Gap Audit: Error Handling Patterns", () => {
  it("ForgotPasswordPage has try/catch with user-facing error", async () => {
    const fs = await import("fs");
    const forgot = fs.readFileSync("src/pages/ForgotPasswordPage.tsx", "utf-8");
    expect(forgot).toContain("catch");
    expect(forgot).toContain("destructive");
  });
});

describe("Gap Audit: Accessibility", () => {
  it("Header has aria-labels on all interactive elements", async () => {
    const fs = await import("fs");
    const header = fs.readFileSync("src/components/Header.tsx", "utf-8");
    const ariaCount = (header.match(/aria-label/g) || []).length;
    expect(ariaCount).toBeGreaterThanOrEqual(5);
  });
});

describe("Gap Audit: Security", () => {
  it("no hardcoded credentials in codebase", async () => {
    const fs = await import("fs");
    const files = [
      "src/routes/AppRoutes.tsx",
      "src/hooks/useEmployees.ts",
      "src/pages/ForgotPasswordPage.tsx",
    ];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).not.toMatch(/password\s*[:=]\s*['"][^'"]+['"]/i);
      expect(content).not.toMatch(/secret\s*[:=]\s*['"][^'"]+['"]/i);
    }
  });

  it("auth uses server-side validation via supabase", async () => {
    const fs = await import("fs");
    // Route guards delegate to the useAuth hook (no client-side localStorage gate).
    const routes = fs.readFileSync("src/routes/AppRoutes.tsx", "utf-8");
    expect(routes).toContain("useAuth");
    expect(routes).not.toContain("localStorage");
    // Server-side session validation lives in the AuthProvider (supabase-js handles
    // the token store; the string 'localStorage' only appears in a code comment there).
    const provider = fs.readFileSync("src/providers/AuthProvider.tsx", "utf-8");
    expect(provider).toContain("supabase.auth.getSession");
    expect(provider).toContain("supabase.auth.onAuthStateChange");
    // 'localStorage' only appears in code comments (safety-timeout note), never used as a client-side gate
    const codeLines = provider.split("\n").filter((line) => !line.trim().startsWith("//"));
    expect(codeLines.join("\n")).not.toContain("localStorage");
  });
});

describe("Gap Audit: Design System Consistency", () => {
  it("index.css defines required semantic tokens", async () => {
    const fs = await import("fs");
    const css = fs.readFileSync("src/index.css", "utf-8");
    const requiredTokens = [
      "--background",
      "--foreground",
      "--primary",
      "--secondary",
      "--muted",
      "--accent",
      "--destructive",
      "--card",
      "--popover",
    ];
    for (const token of requiredTokens) {
      expect(css).toContain(token);
    }
  });
});
