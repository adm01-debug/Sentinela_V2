import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "../components/ui/progress";
import { useState, useEffect } from "react";

const meta: Meta<typeof Progress> = {
  title: "UI/ProgressIndicator",
  component: Progress,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 60,
    className: "w-64",
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    className: "w-64",
  },
};

export const Full: Story = {
  args: {
    value: 100,
    className: "w-64",
  },
};

export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 10));
      }, 500);
      return () => clearInterval(timer);
    }, []);
    return <Progress value={progress} className="w-64" />;
  },
};

export const WithLabel: Story = {
  render: () => {
    const value = 75;
    return (
      <div className="w-64 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Uploading...</span>
          <span>{value}%</span>
        </div>
        <Progress value={value} />
      </div>
    );
  },
};

export const MultipleSteps: Story = {
  render: () => (
    <div className="w-64 space-y-4">
      <div>
        <p className="text-sm mb-1">Step 1: Complete</p>
        <Progress value={100} />
      </div>
      <div>
        <p className="text-sm mb-1">Step 2: In Progress</p>
        <Progress value={45} />
      </div>
      <div>
        <p className="text-sm mb-1">Step 3: Not Started</p>
        <Progress value={0} />
      </div>
    </div>
  ),
};
