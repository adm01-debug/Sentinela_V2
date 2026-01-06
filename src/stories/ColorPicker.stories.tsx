import type { Meta, StoryObj } from "@storybook/react";
import { ColorPicker } from "../components/ui/ColorPicker";
import { useState } from "react";

const meta: Meta<typeof ColorPicker> = {
  title: "UI/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "#6366f1",
    className: "w-64",
  },
};

export const CustomPresets: Story = {
  args: {
    value: "#22c55e",
    presetColors: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6"],
    className: "w-64",
  },
};

export const Controlled: Story = {
  render: () => {
    const [color, setColor] = useState("#3b82f6");
    return (
      <div className="space-y-4">
        <ColorPicker value={color} onChange={setColor} className="w-64" />
        <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: color }} />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    value: "#6366f1",
    disabled: true,
    className: "w-64",
  },
};
