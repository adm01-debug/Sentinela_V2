import type { Meta, StoryObj } from "@storybook/react";
import { TreeView } from "../components/ui/TreeView";
import { Folder, File, Image, Code } from "lucide-react";

const meta: Meta<typeof TreeView> = {
  title: "UI/TreeView",
  component: TreeView,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

const fileTree = [
  {
    id: "1",
    label: "src",
    icon: <Folder className="h-4 w-4" />,
    children: [
      {
        id: "1-1",
        label: "components",
        icon: <Folder className="h-4 w-4" />,
        children: [
          { id: "1-1-1", label: "Button.tsx", icon: <Code className="h-4 w-4" /> },
          { id: "1-1-2", label: "Input.tsx", icon: <Code className="h-4 w-4" /> },
        ],
      },
      {
        id: "1-2",
        label: "pages",
        icon: <Folder className="h-4 w-4" />,
        children: [
          { id: "1-2-1", label: "Home.tsx", icon: <Code className="h-4 w-4" /> },
          { id: "1-2-2", label: "About.tsx", icon: <Code className="h-4 w-4" /> },
        ],
      },
    ],
  },
  {
    id: "2",
    label: "public",
    icon: <Folder className="h-4 w-4" />,
    children: [
      { id: "2-1", label: "favicon.ico", icon: <Image className="h-4 w-4" /> },
      { id: "2-2", label: "index.html", icon: <File className="h-4 w-4" /> },
    ],
  },
];

export const Default: Story = {
  args: {
    data: fileTree,
    className: "w-64 border rounded-lg p-2",
  },
};

export const ExpandedByDefault: Story = {
  args: {
    data: fileTree,
    defaultExpandAll: true,
    className: "w-64 border rounded-lg p-2",
  },
};

export const WithSelection: Story = {
  args: {
    data: fileTree,
    onSelect: (node) => console.log("Selected:", node),
    className: "w-64 border rounded-lg p-2",
  },
};
