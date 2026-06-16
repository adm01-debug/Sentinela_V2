import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  DashboardSkeleton,
  StatsCardSkeleton,
  ChartCardSkeleton,
  AlertCardSkeleton,
  ActivityItemSkeleton,
} from "@/components/dashboard/DashboardSkeleton";

describe("Dashboard Skeleton Components", () => {
  describe("StatsCardSkeleton", () => {
    it("renders card structure", () => {
      const { container } = render(<StatsCardSkeleton />);
      expect(container.querySelector('[class*="overflow-hidden"]')).toBeInTheDocument();
    });

    it("renders title skeleton", () => {
      const { container } = render(<StatsCardSkeleton />);
      expect(container.querySelector(".h-4.w-28")).toBeInTheDocument();
    });

    it("renders icon skeleton", () => {
      const { container } = render(<StatsCardSkeleton />);
      expect(container.querySelector(".h-9.w-9")).toBeInTheDocument();
    });

    it("renders value skeleton", () => {
      const { container } = render(<StatsCardSkeleton />);
      expect(container.querySelector(".h-8.w-16")).toBeInTheDocument();
    });

    it("renders sparkline placeholder", () => {
      const { container } = render(<StatsCardSkeleton />);
      expect(container.querySelector(".w-20.h-10")).toBeInTheDocument();
    });
  });

  describe("ChartCardSkeleton", () => {
    it("renders header skeleton", () => {
      const { container } = render(<ChartCardSkeleton />);
      expect(container.querySelector(".h-5.w-40")).toBeInTheDocument();
    });

    it("renders 12 bar placeholders", () => {
      const { container } = render(<ChartCardSkeleton />);
      const bars = container.querySelectorAll(".rounded-t");
      expect(bars.length).toBe(12);
    });

    it("accepts className prop", () => {
      const { container } = render(<ChartCardSkeleton className="lg:col-span-4" />);
      expect(container.querySelector(".lg\\:col-span-4")).toBeInTheDocument();
    });
  });

  describe("AlertCardSkeleton", () => {
    it("renders icon placeholder", () => {
      const { container } = render(<AlertCardSkeleton />);
      expect(container.querySelector(".h-4.w-4")).toBeInTheDocument();
    });

    it("renders text placeholders", () => {
      const { container } = render(<AlertCardSkeleton />);
      expect(container.querySelector(".h-4.w-full")).toBeInTheDocument();
      expect(container.querySelector(".h-3.w-32")).toBeInTheDocument();
    });

    it("renders badge placeholder", () => {
      const { container } = render(<AlertCardSkeleton />);
      expect(container.querySelector(".h-5.w-14")).toBeInTheDocument();
    });
  });

  describe("ActivityItemSkeleton", () => {
    it("renders avatar placeholder", () => {
      const { container } = render(<ActivityItemSkeleton />);
      expect(container.querySelector(".w-8.h-8.rounded-full")).toBeInTheDocument();
    });

    it("renders text lines", () => {
      const { container } = render(<ActivityItemSkeleton />);
      expect(container.querySelector(".h-4.w-48")).toBeInTheDocument();
      expect(container.querySelector(".h-3.w-20")).toBeInTheDocument();
    });
  });

  describe("DashboardSkeleton (Full)", () => {
    it("renders without crashing", () => {
      const { container } = render(<DashboardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders welcome banner skeleton", () => {
      const { container } = render(<DashboardSkeleton />);
      expect(container.querySelector(".h-20")).toBeInTheDocument();
    });

    it("renders 4 stats card skeletons", () => {
      const { container } = render(<DashboardSkeleton />);
      const statsGrid = container.querySelector(
        ".grid.gap-4.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4"
      );
      expect(statsGrid).toBeInTheDocument();
      expect(statsGrid?.children.length).toBe(4);
    });

    it("renders chart skeletons row", () => {
      const { container } = render(<DashboardSkeleton />);
      expect(container.querySelector(".lg\\:col-span-4")).toBeInTheDocument();
      expect(container.querySelector(".lg\\:col-span-3")).toBeInTheDocument();
    });

    it("renders alert card skeletons", () => {
      const { container } = render(<DashboardSkeleton />);
      const alertSection = container.querySelector(".lg\\:col-span-5");
      expect(alertSection).toBeInTheDocument();
    });

    it("renders activity item skeletons", () => {
      const { container } = render(<DashboardSkeleton />);
      const activitySection = container.querySelector(".lg\\:col-span-4");
      expect(activitySection).toBeInTheDocument();
    });

    it("has fade-in animation class", () => {
      const { container } = render(<DashboardSkeleton />);
      expect(container.querySelector(".animate-in.fade-in")).toBeInTheDocument();
    });

    it("renders donut chart placeholder", () => {
      const { container } = render(<DashboardSkeleton />);
      // Donut chart skeleton inside lg:col-span-3
      const donutSection = container.querySelectorAll(".lg\\:col-span-3");
      expect(donutSection.length).toBeGreaterThan(0);
    });
  });
});
