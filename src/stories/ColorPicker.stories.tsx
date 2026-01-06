import type { Meta, StoryObj } from "@storybook/react";
import { ColorPicker } from "../components/ui/ColorPicker";
import { useState } from "react";

const meta: Meta<typeof ColorPicker> = { title: "UI/ColorPicker", component: ColorPicker, tags: ["autodocs"], parameters: { layout: "centered" } };
export default meta;

export const Default: StoryObj = { render: () => <ColorPicker className="w-48" /> };
export const Controlled: StoryObj = { render: () => { const [color, setColor] = useState("#6366f1"); return <ColorPicker value={color} onChange={setColor} className="w-48" />; } };
export const CustomPresets: StoryObj = { render: () => <ColorPicker presetColors={["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"]} className="w-48" /> };
export const Disabled: StoryObj = { render: () => <ColorPicker disabled className="w-48" /> };
