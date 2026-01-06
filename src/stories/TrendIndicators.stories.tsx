import type { Meta } from "@storybook/react";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "../lib/utils";

const meta: Meta = {
  title: "UI/TrendIndicators",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

const TrendBadge = ({ value, trend }: { value: string; trend: "up" | "down" | "neutral" }) => (
  <span className={cn(
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
    trend === "up" && "bg-green-100 text-green-700",
    trend === "down" && "bg-red-100 text-red-700",
    trend === "neutral" && "bg-gray-100 text-gray-700"
  )}>
    {trend === "up" && <TrendingUp className="h-3 w-3" />}
    {trend === "down" && <TrendingDown className="h-3 w-3" />}
    {trend === "neutral" && <Minus className="h-3 w-3" />}
    {value}
  </span>
);

export const Badges = {
  render: () => (
    <div className="flex gap-2">
      <TrendBadge value="+12.5%" trend="up" />
      <TrendBadge value="-8.3%" trend="down" />
      <TrendBadge value="0.0%" trend="neutral" />
    </div>
  ),
};

export const InlineText = {
  render: () => (
    <div className="space-y-2">
      <p className="flex items-center gap-1 text-sm">
        Revenue <span className="text-green-600 flex items-center"><ArrowUp className="h-3 w-3" />12%</span> this month
      </p>
      <p className="flex items-center gap-1 text-sm">
        Costs <span className="text-red-600 flex items-center"><ArrowDown className="h-3 w-3" />5%</span> vs last quarter
      </p>
    </div>
  ),
};

export const StatCards = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Users</p>
        <p className="text-2xl font-bold">1,234</p>
        <TrendBadge value="+15%" trend="up" />
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Bounce Rate</p>
        <p className="text-2xl font-bold">32%</p>
        <TrendBadge value="-3%" trend="down" />
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Avg Session</p>
        <p className="text-2xl font-bold">4m 32s</p>
        <TrendBadge value="0%" trend="neutral" />
      </div>
    </div>
  ),
};
