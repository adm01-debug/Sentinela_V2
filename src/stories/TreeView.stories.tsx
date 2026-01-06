import type { Meta, StoryObj } from "@storybook/react";
import { TreeView } from "../components/ui/TreeView";
import { Folder, File } from "lucide-react";

const meta: Meta<typeof TreeView> = { title: "UI/TreeView", component: TreeView, tags: ["autodocs"], parameters: { layout: "centered" } };
export default meta;

const data = [
  { id: "1", label: "Documents", children: [{ id: "1-1", label: "Report.pdf" }, { id: "1-2", label: "Notes.txt" }] },
  { id: "2", label: "Images", children: [{ id: "2-1", label: "photo.jpg" }, { id: "2-2", label: "logo.png" }] },
  { id: "3", label: "README.md" },
];

export const Default: StoryObj = { render: () => <TreeView data={data} className="w-64" /> };
export const Expanded: StoryObj = { render: () => <TreeView data={data} defaultExpandAll className="w-64" /> };
export const WithSelection: StoryObj = { render: () => <TreeView data={data} onSelect={(node) => alert(node.label)} className="w-64" /> };
