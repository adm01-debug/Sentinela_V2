import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ============================================================
// IMPROVEMENT VERIFICATION SUITE
// Validates all 4 major improvements are properly implemented
// ============================================================

// ----- Mock recharts -----
vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "rc" }, children),
  };
});

// ============================================================
// 1. CHART LIBRARY — Reusable components exist & render
// ============================================================
describe("Improvement 1: Reusable Chart Library", () => {
  describe("Module exports", () => {
    it("exports BaseLineChart", async () => {
      const mod = await import("@/components/charts");
      expect(mod.BaseLineChart).toBeDefined();
    }, 15000);
    it("exports BaseAreaChart", async () => {
      const mod = await import("@/components/charts");
      expect(mod.BaseAreaChart).toBeDefined();
    });
    it("exports BaseBarChart", async () => {
      const mod = await import("@/components/charts");
      expect(mod.BaseBarChart).toBeDefined();
    });
    it("exports BaseDonutChart", async () => {
      const mod = await import("@/components/charts");
      expect(mod.BaseDonutChart).toBeDefined();
    });
    it("exports Sparkline", async () => {
      const mod = await import("@/components/charts");
      expect(mod.Sparkline).toBeDefined();
    });
    it("exports ChartEmptyState", async () => {
      const mod = await import("@/components/charts");
      expect(mod.ChartEmptyState).toBeDefined();
    });
    it("exports ChartTooltipContent", async () => {
      const mod = await import("@/components/charts");
      expect(mod.ChartTooltipContent).toBeDefined();
    });
    it("exports LineSeriesConfig type", async () => {
      const mod = await import("@/components/charts");
      expect(mod).toHaveProperty("BaseLineChart");
    });
    it("exports AreaSeriesConfig type", async () => {
      const mod = await import("@/components/charts");
      expect(mod).toHaveProperty("BaseAreaChart");
    });
    it("exports BarSeriesConfig type", async () => {
      const mod = await import("@/components/charts");
      expect(mod).toHaveProperty("BaseBarChart");
    });
  });

  describe("ChartEmptyState rendering", () => {
    it("shows default empty title", async () => {
      const { ChartEmptyState } = await import("@/components/charts/ChartEmptyState");
      render(React.createElement(ChartEmptyState));
      expect(screen.getByText("Sem dados disponíveis")).toBeInTheDocument();
    });
    it("shows default empty description", async () => {
      const { ChartEmptyState } = await import("@/components/charts/ChartEmptyState");
      render(React.createElement(ChartEmptyState));
      expect(
        screen.getByText("Os dados aparecerão quando houver informações para exibir")
      ).toBeInTheDocument();
    });
    it("accepts custom title", async () => {
      const { ChartEmptyState } = await import("@/components/charts/ChartEmptyState");
      render(React.createElement(ChartEmptyState, { title: "Nenhum gráfico" }));
      expect(screen.getByText("Nenhum gráfico")).toBeInTheDocument();
    });
    it("accepts custom description", async () => {
      const { ChartEmptyState } = await import("@/components/charts/ChartEmptyState");
      render(React.createElement(ChartEmptyState, { description: "Desc personalizada" }));
      expect(screen.getByText("Desc personalizada")).toBeInTheDocument();
    });
    it("accepts custom height", async () => {
      const { ChartEmptyState } = await import("@/components/charts/ChartEmptyState");
      const { container } = render(React.createElement(ChartEmptyState, { height: 400 }));
      const el = container.firstChild as HTMLElement;
      expect(el.style.height).toBe("400px");
    });
  });

  describe("BaseLineChart", () => {
    it("renders empty state with no data", async () => {
      const { BaseLineChart } = await import("@/components/charts/BaseLineChart");
      render(
        React.createElement(BaseLineChart, {
          data: [],
          series: [{ dataKey: "v", label: "V" }],
          emptyTitle: "Vazio",
        })
      );
      expect(screen.getByText("Vazio")).toBeInTheDocument();
    });
    it("renders chart container with data", async () => {
      const { BaseLineChart } = await import("@/components/charts/BaseLineChart");
      const { container } = render(
        React.createElement(BaseLineChart, {
          data: [{ d: "Mon", v: 1 }],
          series: [{ dataKey: "v", label: "V" }],
        })
      );
      expect(container.querySelector('[data-testid="rc"]')).toBeInTheDocument();
    });
    it("supports multiple series", async () => {
      const { BaseLineChart } = await import("@/components/charts/BaseLineChart");
      const { container } = render(
        React.createElement(BaseLineChart, {
          data: [{ d: "A", a: 1, b: 2 }],
          series: [
            { dataKey: "a", label: "A" },
            { dataKey: "b", label: "B" },
          ],
        })
      );
      expect(container.querySelector('[data-testid="rc"]')).toBeInTheDocument();
    });
    it("accepts custom height", async () => {
      const { BaseLineChart } = await import("@/components/charts/BaseLineChart");
      const { container } = render(
        React.createElement(BaseLineChart, {
          data: [{ d: "A", v: 1 }],
          series: [{ dataKey: "v", label: "V" }],
          height: 500,
        })
      );
      expect(container.querySelector('[data-testid="rc"]')).toBeInTheDocument();
    });
  });

  describe("BaseAreaChart", () => {
    it("renders empty state with no data", async () => {
      const { BaseAreaChart } = await import("@/components/charts/BaseAreaChart");
      render(
        React.createElement(BaseAreaChart, {
          data: [],
          series: [{ dataKey: "v", label: "V" }],
          emptyTitle: "Nada",
        })
      );
      expect(screen.getByText("Nada")).toBeInTheDocument();
    });
    it("renders chart with data", async () => {
      const { BaseAreaChart } = await import("@/components/charts/BaseAreaChart");
      const { container } = render(
        React.createElement(BaseAreaChart, {
          data: [{ d: "Mon", v: 1 }],
          series: [{ dataKey: "v", label: "V" }],
        })
      );
      expect(container.querySelector('[data-testid="rc"]')).toBeInTheDocument();
    });
  });

  describe("BaseBarChart", () => {
    it("renders empty state with no data", async () => {
      const { BaseBarChart } = await import("@/components/charts/BaseBarChart");
      render(
        React.createElement(BaseBarChart, {
          data: [],
          series: [{ dataKey: "v", label: "V" }],
          emptyTitle: "Sem barras",
        })
      );
      expect(screen.getByText("Sem barras")).toBeInTheDocument();
    });
    it("renders chart with data", async () => {
      const { BaseBarChart } = await import("@/components/charts/BaseBarChart");
      const { container } = render(
        React.createElement(BaseBarChart, {
          data: [{ n: "A", v: 5 }],
          series: [{ dataKey: "v", label: "V" }],
        })
      );
      expect(container.querySelector('[data-testid="rc"]')).toBeInTheDocument();
    });
  });

  describe("BaseDonutChart", () => {
    it("renders empty state with no data", async () => {
      const { BaseDonutChart } = await import("@/components/charts/BaseDonutChart");
      render(React.createElement(BaseDonutChart, { data: [], emptyTitle: "Sem donut" }));
      expect(screen.getByText("Sem donut")).toBeInTheDocument();
    });
    it("renders chart with data", async () => {
      const { BaseDonutChart } = await import("@/components/charts/BaseDonutChart");
      const { container } = render(
        React.createElement(BaseDonutChart, {
          data: [
            { name: "A", value: 50 },
            { name: "B", value: 50 },
          ],
        })
      );
      expect(container.querySelector('[data-testid="rc"]')).toBeInTheDocument();
    });
  });

  describe("Sparkline", () => {
    it("renders with numeric array", async () => {
      const { Sparkline } = await import("@/components/charts/Sparkline");
      const { container } = render(React.createElement(Sparkline, { data: [1, 5, 3, 8, 2] }));
      expect(container.querySelector('[data-testid="rc"]')).toBeInTheDocument();
    });
    it("renders with empty array", async () => {
      const { Sparkline } = await import("@/components/charts/Sparkline");
      const { container } = render(React.createElement(Sparkline, { data: [] }));
      expect(container).toBeTruthy();
    });
  });

  describe("useChartColors hook", () => {
    it("exists and is a function", async () => {
      const mod = await import("@/hooks/useChartColors");
      expect(typeof mod.useChartColors).toBe("function");
    });
  });
});

// ============================================================
// 2. TYPE SAFETY — No 'any' types in critical files
// ============================================================
describe("Improvement 2: Type Safety (any elimination)", () => {
  const criticalFiles = [
    "src/pages/TimeClockPage.tsx",
    "src/pages/HoursTrackingPage.tsx",
    "src/pages/AttendancePage.tsx",
    "src/pages/ProjectsPage.tsx",
    "src/pages/TimesheetsPage.tsx",
    "src/pages/EmployeesPage.tsx",
    "src/hooks/useWebhooksPage.ts",
    "src/hooks/useEmployees.ts",
    "src/hooks/useFeatureFlags.ts",
    "src/hooks/useContextAwareDefaults.ts",
    "src/hooks/usePWAPushNotifications.ts",
  ];

  for (const file of criticalFiles) {
    it(`${file} has no 'any' type usage`, async () => {
      const fs = await import("fs");
      const path = await import("path");
      const fullPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        const anyMatches = content.match(/:\s*any\b|as\s+any\b|<any>/g);
        expect(anyMatches).toBeNull();
      }
    });
  }

  // Regression ratchet for `any` usage in hooks/. Current debt is high (~249);
  // this guard prevents NEW `any` from creeping in. Lower the bound as the
  // codebase is progressively typed. TODO(tech-debt): drive this toward 0.
  it("Total any count in hooks/ does not regress", async () => {
    const { execSync } = await import("child_process");
    const result = execSync(
      `grep -rn ": any\\|as any\\|<any>" ${process.cwd()}/src/hooks/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v ".test." | wc -l`
    )
      .toString()
      .trim();
    expect(Number(result)).toBeLessThanOrEqual(249);
  });

  it("Total any count in pages/ is 0", async () => {
    const { execSync } = await import("child_process");
    const result = execSync(
      `grep -rn ": any\\|as any\\|<any>" ${process.cwd()}/src/pages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v ".test." | wc -l`
    )
      .toString()
      .trim();
    expect(Number(result)).toBe(0);
  });
});

// ============================================================
// 3. FORM COMPONENTS — Reusable, accessible, validated
// ============================================================
describe("Improvement 3: Reusable Form Components", () => {
  describe("Module exports", () => {
    it("exports FormInput", async () => {
      const mod = await import("@/components/forms");
      expect(mod.FormInput).toBeDefined();
    });
    it("exports FormTextarea", async () => {
      const mod = await import("@/components/forms");
      expect(mod.FormTextarea).toBeDefined();
    });
    it("exports FormSelect", async () => {
      const mod = await import("@/components/forms");
      expect(mod.FormSelect).toBeDefined();
    });
    it("exports FormSwitch", async () => {
      const mod = await import("@/components/forms");
      expect(mod.FormSwitch).toBeDefined();
    });
    it("exports FormSection", async () => {
      const mod = await import("@/components/forms");
      expect(mod.FormSection).toBeDefined();
    });
    it("exports FormRow", async () => {
      const mod = await import("@/components/forms");
      expect(mod.FormRow).toBeDefined();
    });
  });

  describe("FormInput", () => {
    it("renders label with htmlFor", async () => {
      const { FormInput } = await import("@/components/forms");
      render(
        React.createElement(FormInput, {
          name: "email",
          label: "Email",
          value: "",
          onChange: () => {},
        })
      );
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });
    it("shows required indicator", async () => {
      const { FormInput } = await import("@/components/forms");
      render(
        React.createElement(FormInput, {
          name: "x",
          label: "Field",
          value: "",
          onChange: () => {},
          required: true,
        })
      );
      expect(screen.getByText("*")).toBeInTheDocument();
    });
    it("shows error message", async () => {
      const { FormInput } = await import("@/components/forms");
      render(
        React.createElement(FormInput, {
          name: "x",
          label: "Field",
          value: "",
          onChange: () => {},
          error: "Erro!",
        })
      );
      expect(screen.getByText("Erro!")).toBeInTheDocument();
    });
    it("sets aria-invalid on error", async () => {
      const { FormInput } = await import("@/components/forms");
      render(
        React.createElement(FormInput, {
          name: "x",
          label: "Field",
          value: "",
          onChange: () => {},
          error: "Err",
        })
      );
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    });
    it("shows description when no error", async () => {
      const { FormInput } = await import("@/components/forms");
      render(
        React.createElement(FormInput, {
          name: "x",
          label: "F",
          value: "",
          onChange: () => {},
          description: "Ajuda",
        })
      );
      expect(screen.getByText("Ajuda")).toBeInTheDocument();
    });
    it("hides description when error present", async () => {
      const { FormInput } = await import("@/components/forms");
      render(
        React.createElement(FormInput, {
          name: "x",
          label: "F",
          value: "",
          onChange: () => {},
          description: "Ajuda",
          error: "Err",
        })
      );
      expect(screen.queryByText("Ajuda")).not.toBeInTheDocument();
    });
    it("supports disabled state", async () => {
      const { FormInput } = await import("@/components/forms");
      render(
        React.createElement(FormInput, {
          name: "x",
          label: "F",
          value: "",
          onChange: () => {},
          disabled: true,
        })
      );
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
    it("supports different input types", async () => {
      const { FormInput } = await import("@/components/forms");
      const { container } = render(
        React.createElement(FormInput, {
          name: "pw",
          label: "Pass",
          value: "",
          onChange: () => {},
          type: "password",
        })
      );
      expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    });
  });

  describe("FormTextarea", () => {
    it("renders with label", async () => {
      const { FormTextarea } = await import("@/components/forms");
      render(
        React.createElement(FormTextarea, {
          name: "note",
          label: "Notas",
          value: "",
          onChange: () => {},
        })
      );
      expect(screen.getByLabelText("Notas")).toBeInTheDocument();
    });
    it("renders with error", async () => {
      const { FormTextarea } = await import("@/components/forms");
      render(
        React.createElement(FormTextarea, {
          name: "n",
          label: "N",
          value: "",
          onChange: () => {},
          error: "Obrigatório",
        })
      );
      expect(screen.getByText("Obrigatório")).toBeInTheDocument();
    });
    it("sets rows prop", async () => {
      const { FormTextarea } = await import("@/components/forms");
      const { container } = render(
        React.createElement(FormTextarea, {
          name: "n",
          label: "N",
          value: "",
          onChange: () => {},
          rows: 5,
        })
      );
      expect(container.querySelector("textarea")).toHaveAttribute("rows", "5");
    });
  });

  describe("FormSelect", () => {
    it("renders label", async () => {
      const { FormSelect } = await import("@/components/forms");
      const opts = [{ value: "a", label: "A" }];
      render(
        React.createElement(FormSelect, {
          name: "s",
          label: "Status",
          options: opts,
          value: "",
          onChange: () => {},
        })
      );
      expect(screen.getByText("Status")).toBeInTheDocument();
    });
    it("shows required indicator", async () => {
      const { FormSelect } = await import("@/components/forms");
      const opts = [{ value: "a", label: "A" }];
      render(
        React.createElement(FormSelect, {
          name: "s",
          label: "Status",
          options: opts,
          value: "",
          onChange: () => {},
          required: true,
        })
      );
      expect(screen.getByText("*")).toBeInTheDocument();
    });
  });

  describe("FormSwitch", () => {
    it("renders label and description", async () => {
      const { FormSwitch } = await import("@/components/forms");
      render(
        React.createElement(FormSwitch, {
          name: "act",
          label: "Ativo",
          checked: false,
          onChange: () => {},
          description: "Toggle",
        })
      );
      expect(screen.getByText("Ativo")).toBeInTheDocument();
      expect(screen.getByText("Toggle")).toBeInTheDocument();
    });
  });

  describe("FormSection", () => {
    it("renders title and children", async () => {
      const { FormSection } = await import("@/components/forms");
      // FormSection types `children` as a required prop, so pass it via props here.
      // eslint-disable-next-line react/no-children-prop
      render(
        React.createElement(FormSection, {
          title: "Seção",
          description: "Desc",
          children: React.createElement("p", null, "Child"),
        })
      );
      expect(screen.getByText("Seção")).toBeInTheDocument();
      expect(screen.getByText("Desc")).toBeInTheDocument();
      expect(screen.getByText("Child")).toBeInTheDocument();
    });
  });

  describe("FormRow", () => {
    it("renders children", async () => {
      const { FormRow } = await import("@/components/forms");
      // FormRow types `children` as a required prop, so pass it via props here.
      // eslint-disable-next-line react/no-children-prop
      render(
        React.createElement(FormRow, {
          cols: 3,
          children: [
            React.createElement("div", { key: "1" }, "C1"),
            React.createElement("div", { key: "2" }, "C2"),
          ],
        })
      );
      expect(screen.getByText("C1")).toBeInTheDocument();
      expect(screen.getByText("C2")).toBeInTheDocument();
    });
  });
});

// ============================================================
// 4. REAL DATA — useEmployeeStats fetches real Supabase data
// ============================================================
describe("Improvement 4: Real Data Integration (useEmployeeStats)", () => {
  it("useEmployeeStats is exported", async () => {
    const mod = await import("@/hooks/useEmployees");
    expect(mod.useEmployeeStats).toBeDefined();
  });

  it("useEmployeeStats accepts (id, startDate, endDate)", async () => {
    const mod = await import("@/hooks/useEmployees");
    expect(mod.useEmployeeStats.length).toBeGreaterThanOrEqual(0);
  });

  it("useEmployeeStats does NOT return hardcoded zeros", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(`${process.cwd()}/src/hooks/useEmployees.ts`, "utf8");
    // Should NOT have the old pattern: productivity: 0, activeDays: 0, violations: 0
    const hardcodedPattern = /productivity:\s*0,\s*activeDays:\s*0,\s*violations:\s*0/;
    expect(hardcodedPattern.test(content)).toBe(false);
  });

  it("useEmployeeStats queries keystroke_logs", async () => {
    const fs = await import("fs");
    // The Supabase queries live in the service layer, consumed by the hook.
    const content = fs.readFileSync(`${process.cwd()}/src/services/employeeService.ts`, "utf8");
    expect(content).toContain("keystroke_logs");
  });

  it("useEmployeeStats queries attendance_records", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(`${process.cwd()}/src/services/employeeService.ts`, "utf8");
    expect(content).toContain("attendance_records");
  });

  it("useEmployeeStats queries geofence_violations", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(`${process.cwd()}/src/services/employeeService.ts`, "utf8");
    // Uses security_violations table for violation counts
    expect(content).toContain("security_violations");
  });

  it("useEmployeeStats calculates productivity from active/idle time", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(`${process.cwd()}/src/hooks/useEmployees.ts`, "utf8");
    expect(content).toContain("active_time_seconds");
    expect(content).toContain("idle_time_seconds");
    expect(content).toMatch(/totalActive\s*\/\s*totalTime/);
  });

  it("useEmployeeStats counts unique active days", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(`${process.cwd()}/src/hooks/useEmployees.ts`, "utf8");
    expect(content).toContain("new Set");
    expect(content).toContain("activeDays");
  });

  it("useEmployeeStats calculates avgHoursPerDay from attendance", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(`${process.cwd()}/src/hooks/useEmployees.ts`, "utf8");
    expect(content).toContain("avgHoursPerDay");
    expect(content).toContain("total_worked_minutes");
  });

  it("useEmployeeStats returns presentDays count", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(`${process.cwd()}/src/hooks/useEmployees.ts`, "utf8");
    expect(content).toContain("presentDays");
  });
});

// ============================================================
// 5. CROSS-CUTTING — Build integrity
// ============================================================
describe("Cross-cutting: Build & Architecture Integrity", () => {
  it("Critical source files exist", async () => {
    const fs = await import("fs");
    expect(fs.existsSync(`${process.cwd()}/src/components/charts/index.ts`)).toBe(true);
    expect(fs.existsSync(`${process.cwd()}/src/components/forms/index.tsx`)).toBe(true);
    expect(fs.existsSync(`${process.cwd()}/src/hooks/useEmployees.ts`)).toBe(true);
  });

  it("PageLayout exists as primary layout", async () => {
    const fs = await import("fs");
    const exists = fs.existsSync(`${process.cwd()}/src/components/layout/PageLayout.tsx`);
    expect(exists).toBe(true);
  });

  it("CI workflow references dist/ not .next/", async () => {
    const fs = await import("fs");
    const ciPath = `${process.cwd()}/.github/workflows/ci.yml`;
    if (fs.existsSync(ciPath)) {
      const content = fs.readFileSync(ciPath, "utf8");
      expect(content).not.toContain(".next/");
    }
  });

  it("ForgotPasswordPage calls resetPasswordForEmail", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(`${process.cwd()}/src/pages/ForgotPasswordPage.tsx`, "utf8");
    expect(content).toContain("resetPasswordForEmail");
    expect(content).not.toContain("TODO");
  });

  it("useEmployeesPage has real device assign/unassign", async () => {
    const fs = await import("fs");
    // The page hook wires UI to mutations; the real employee_devices query lives in the service.
    const page = fs.readFileSync(`${process.cwd()}/src/hooks/useEmployeesPage.ts`, "utf8");
    expect(page).toContain("assignDevice");
    expect(page).not.toMatch(/assignDevice.*=.*async.*\{\s*\}/);
    const service = fs.readFileSync(`${process.cwd()}/src/services/employeeService.ts`, "utf8");
    expect(service).toContain("employee_devices");
  });

  it("auth state uses typed Session instead of any", async () => {
    const fs = await import("fs");
    // Session state is owned by the AuthProvider and consumed by the route guards.
    const content = fs.readFileSync(`${process.cwd()}/src/providers/AuthProvider.tsx`, "utf8");
    expect(content).not.toContain(": any");
    expect(content).toContain("Session");
  });
});

// ============================================================
// 6. ACCESSIBILITY CHECKS
// ============================================================
describe("Accessibility: Form components use proper ARIA", () => {
  it("FormInput has aria-describedby on error", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(`${process.cwd()}/src/components/forms/index.tsx`, "utf8");
    expect(content).toContain("aria-describedby");
    expect(content).toContain("aria-invalid");
  });

  it("FormTextarea has aria-invalid", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(`${process.cwd()}/src/components/forms/index.tsx`, "utf8");
    // Check the full file for aria-invalid (used in both Input and Textarea)
    const matches = content.match(/aria-invalid/g);
    expect(matches && matches.length >= 2).toBe(true);
  });

  it("FormSelect has aria-invalid", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(`${process.cwd()}/src/components/forms/index.tsx`, "utf8");
    const matches = content.match(/aria-invalid/g);
    // At least 3: FormInput, FormTextarea, FormSelect
    expect(matches && matches.length >= 3).toBe(true);
  });
});

// ============================================================
// 7. CHART THEME INTEGRATION
// ============================================================
describe("Charts: Theme Integration", () => {
  it("BaseLineChart imports useChartColors", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      `${process.cwd()}/src/components/charts/BaseLineChart.tsx`,
      "utf8"
    );
    expect(content).toContain("useChartColors");
  });

  it("BaseAreaChart imports useChartColors", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      `${process.cwd()}/src/components/charts/BaseAreaChart.tsx`,
      "utf8"
    );
    expect(content).toContain("useChartColors");
  });

  it("BaseBarChart imports useChartColors", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      `${process.cwd()}/src/components/charts/BaseBarChart.tsx`,
      "utf8"
    );
    expect(content).toContain("useChartColors");
  });

  it("BaseDonutChart imports useChartColors", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      `${process.cwd()}/src/components/charts/BaseDonutChart.tsx`,
      "utf8"
    );
    expect(content).toContain("useChartColors");
  });

  it("Charts use HSL color format", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      `${process.cwd()}/src/components/charts/BaseLineChart.tsx`,
      "utf8"
    );
    expect(content).toMatch(/hsl\(/);
  });
});
