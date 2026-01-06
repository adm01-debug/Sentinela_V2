import type { Meta, StoryObj } from "@storybook/react";
import { PasswordStrengthMeter } from "../components/ui/PasswordStrengthMeter";
import { useState } from "react";
import { Input } from "../components/ui/input";

const meta: Meta<typeof PasswordStrengthMeter> = { title: "UI/PasswordStrengthMeter", component: PasswordStrengthMeter, tags: ["autodocs"], parameters: { layout: "centered" } };
export default meta;

export const Interactive: StoryObj = { render: () => { const [pass, setPass] = useState(""); return <div className="w-64 space-y-4"><Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Enter password" /><PasswordStrengthMeter password={pass} /></div>; } };
export const Weak: StoryObj = { render: () => <PasswordStrengthMeter password="abc" className="w-64" /> };
export const Strong: StoryObj = { render: () => <PasswordStrengthMeter password="MyStr0ng!Pass" className="w-64" /> };
export const NoRequirements: StoryObj = { render: () => <PasswordStrengthMeter password="Test123!" showRequirements={false} className="w-64" /> };
