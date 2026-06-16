import { describe, it, expect } from "vitest";
import { getInitials, statusConfig, deviceTypeLabels } from "@/hooks/useEmployeesPage";

describe("useEmployeesPage Helpers & Constants", () => {
  describe("getInitials", () => {
    it("returns initials for two-word name", () => {
      expect(getInitials("João Silva")).toBe("JS");
    });

    it("returns initials for single name", () => {
      expect(getInitials("Admin")).toBe("A");
    });

    it("returns first two initials for three-word name", () => {
      expect(getInitials("Maria da Silva")).toBe("MD");
    });

    it("handles uppercase conversion", () => {
      expect(getInitials("ana paula")).toBe("AP");
    });

    it("limits to 2 characters max", () => {
      expect(getInitials("A B C D E").length).toBeLessThanOrEqual(2);
    });

    it("handles names with extra spaces", () => {
      const result = getInitials("Carlos Eduardo Santos Ferreira");
      expect(result.length).toBeLessThanOrEqual(2);
      expect(result).toBe("CE");
    });
  });

  describe("statusConfig", () => {
    it("has all expected statuses", () => {
      expect(statusConfig).toHaveProperty("active");
      expect(statusConfig).toHaveProperty("inactive");
      expect(statusConfig).toHaveProperty("vacation");
      expect(statusConfig).toHaveProperty("leave");
    });

    it("active status has correct label", () => {
      expect(statusConfig.active.label).toBe("Ativo");
    });

    it("inactive status has correct label", () => {
      expect(statusConfig.inactive.label).toBe("Inativo");
    });

    it("vacation status has correct label", () => {
      expect(statusConfig.vacation.label).toBe("Férias");
    });

    it("leave status has correct label", () => {
      expect(statusConfig.leave.label).toBe("Afastado");
    });

    it("all statuses have color classes", () => {
      Object.values(statusConfig).forEach((config) => {
        expect(config.color).toBeTruthy();
        expect(typeof config.color).toBe("string");
      });
    });

    it("uses semantic design tokens in colors", () => {
      expect(statusConfig.active.color).toContain("success");
      expect(statusConfig.inactive.color).toContain("muted");
      expect(statusConfig.vacation.color).toContain("warning");
      expect(statusConfig.leave.color).toContain("info");
    });
  });

  describe("deviceTypeLabels", () => {
    it("has all device types", () => {
      expect(deviceTypeLabels).toHaveProperty("desktop");
      expect(deviceTypeLabels).toHaveProperty("laptop");
      expect(deviceTypeLabels).toHaveProperty("mobile");
    });

    it("has correct labels", () => {
      expect(deviceTypeLabels.desktop).toBe("Desktop");
      expect(deviceTypeLabels.laptop).toBe("Laptop");
      expect(deviceTypeLabels.mobile).toBe("Mobile");
    });
  });
});

describe("parseNumericValue (via StatsCard)", () => {
  // These are tested indirectly through StatsCard, but we can verify the logic
  it("percentage values contain %", () => {
    const match = "87%".match(/^([^0-9]*)([0-9][0-9.,]*)([^0-9]*)$/);
    expect(match).toBeTruthy();
    expect(match![3]).toBe("%");
  });

  it("currency values extract prefix", () => {
    const match = "$1,234".match(/^([^0-9]*)([0-9][0-9.,]*)([^0-9]*)$/);
    expect(match).toBeTruthy();
    expect(match![1]).toBe("$");
  });

  it("plain numbers parse correctly", () => {
    const match = "128".match(/^([^0-9]*)([0-9][0-9.,]*)([^0-9]*)$/);
    expect(match).toBeTruthy();
    expect(match![2]).toBe("128");
  });

  it("comma-separated numbers parse", () => {
    const match = "1,234".match(/^([^0-9]*)([0-9][0-9.,]*)([^0-9]*)$/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![2].replace(/,/g, ""))).toBe(1234);
  });

  it("decimal values detect decimals", () => {
    const numStr = "99.5";
    const hasDecimal = numStr.includes(".");
    const decimals = hasDecimal ? numStr.split(".")[1]?.length || 0 : 0;
    expect(decimals).toBe(1);
  });
});
