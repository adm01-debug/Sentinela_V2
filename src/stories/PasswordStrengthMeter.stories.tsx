import type { Meta, StoryObj } from "@storybook/react";
import { PasswordStrengthMeter } from "../components/ui/PasswordStrengthMeter";
import { useState } from "react";
import { Input } from "../components/ui/input";

const meta: Meta<typeof PasswordStrengthMeter> = {
  title: "UI/PasswordStrengthMeter",
  component: PasswordStrengthMeter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Weak: Story = {
  args: { password: "abc" },
};

export const Fair: Story = {
  args: { password: "password123" },
};

export const Good: Story = {
  args: { password: "Password123" },
};

export const Strong: Story = {
  args: { password: "Password123!" },
};

export const Excellent: Story = {
  args: { password: "MyStr0ng!Pass@2024" },
};

export const Interactive: Story = {
  render: () => {
    const [password, setPassword] = useState("");
    return (
      <div className="w-64 space-y-4">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
        <PasswordStrengthMeter password={password} />
      </div>
    );
  },
};
