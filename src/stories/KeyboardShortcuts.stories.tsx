import type { Meta } from "@storybook/react";
import { Command, CornerDownLeft, Option, Shift } from "lucide-react";

const meta: Meta = {
  title: "UI/KeyboardShortcuts",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
    {children}
  </kbd>
);

export const SingleKeys = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Kbd>A</Kbd>
      <Kbd>B</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Space</Kbd>
      <Kbd>Tab</Kbd>
    </div>
  ),
};

export const ModifierCombinations = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></div>
        <span className="text-sm text-muted-foreground">Open command palette</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1"><Kbd>⌘</Kbd><Kbd>S</Kbd></div>
        <span className="text-sm text-muted-foreground">Save</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1"><Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>P</Kbd></div>
        <span className="text-sm text-muted-foreground">Quick actions</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1"><Kbd>Ctrl</Kbd><Kbd>Alt</Kbd><Kbd>Delete</Kbd></div>
        <span className="text-sm text-muted-foreground">Task manager</span>
      </div>
    </div>
  ),
};

export const ShortcutsList = {
  render: () => (
    <div className="w-80 border rounded-lg divide-y">
      {[
        { keys: ["⌘", "N"], action: "New document" },
        { keys: ["⌘", "O"], action: "Open file" },
        { keys: ["⌘", "S"], action: "Save" },
        { keys: ["⌘", "⇧", "S"], action: "Save as" },
        { keys: ["⌘", "Z"], action: "Undo" },
        { keys: ["⌘", "⇧", "Z"], action: "Redo" },
      ].map(({ keys, action }) => (
        <div key={action} className="flex items-center justify-between px-3 py-2">
          <span className="text-sm">{action}</span>
          <div className="flex gap-1">
            {keys.map((key, i) => <Kbd key={i}>{key}</Kbd>)}
          </div>
        </div>
      ))}
    </div>
  ),
};
