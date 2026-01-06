import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/ui/button";
import { Edit, Trash2, Eye, Download, Share2, Copy } from "lucide-react";

const meta: Meta = {
  title: "UI/ActionButtons",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const IconButtons = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon"><Copy className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
    </div>
  ),
};

export const WithLabels = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />View</Button>
      <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />Edit</Button>
      <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
    </div>
  ),
};

export const TableActions = {
  render: () => (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
    </div>
  ),
};

export const BulkActions = {
  render: () => (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
      <span className="text-sm text-muted-foreground">3 items selected</span>
      <div className="flex-1" />
      <Button variant="outline" size="sm">Export</Button>
      <Button variant="destructive" size="sm">Delete All</Button>
    </div>
  ),
};
