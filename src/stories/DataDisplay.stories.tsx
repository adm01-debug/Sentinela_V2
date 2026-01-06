import type { Meta } from "@storybook/react";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";

const meta: Meta = {
  title: "UI/DataDisplay",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

const StatusDot = ({ status }: { status: "online" | "offline" | "away" | "busy" }) => {
  const colors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-yellow-500",
    busy: "bg-red-500",
  };
  return <span className={cn("w-2 h-2 rounded-full inline-block", colors[status])} />;
};

export const StatusIndicators = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2"><StatusDot status="online" /> Online</div>
      <div className="flex items-center gap-2"><StatusDot status="away" /> Away</div>
      <div className="flex items-center gap-2"><StatusDot status="busy" /> Busy</div>
      <div className="flex items-center gap-2"><StatusDot status="offline" /> Offline</div>
    </div>
  ),
};

export const BadgeVariants = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
};

export const SeverityBadges = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-red-500 hover:bg-red-600">Critical</Badge>
      <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>
      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Medium</Badge>
      <Badge className="bg-blue-500 hover:bg-blue-600">Low</Badge>
      <Badge className="bg-gray-500 hover:bg-gray-600">Info</Badge>
    </div>
  ),
};

export const KeyValuePairs = {
  render: () => (
    <dl className="w-64 space-y-2">
      {[
        { label: "Name", value: "John Doe" },
        { label: "Email", value: "john@example.com" },
        { label: "Role", value: "Administrator" },
        { label: "Status", value: <Badge variant="secondary">Active</Badge> },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  ),
};
