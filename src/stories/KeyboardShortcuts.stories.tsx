import type { Meta, StoryObj } from '@storybook/react';
import { KeyboardShortcuts, ShortcutKey } from '../components/ui/KeyboardShortcuts';

const meta: Meta<typeof KeyboardShortcuts> = {
  title: 'UI/KeyboardShortcuts',
  component: KeyboardShortcuts,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof KeyboardShortcuts>;

export const Default: Story = {
  args: {
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Open command palette' },
      { keys: ['Ctrl', 'S'], description: 'Save changes' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['Esc'], description: 'Close modal' },
    ],
  },
};

export const SingleKey: StoryObj = {
  render: () => (
    <div className="flex gap-2">
      <ShortcutKey>K</ShortcutKey>
      <ShortcutKey>Enter</ShortcutKey>
      <ShortcutKey>Esc</ShortcutKey>
    </div>
  ),
};

export const Combination: StoryObj = {
  render: () => (
    <div className="flex items-center gap-1">
      <ShortcutKey>Ctrl</ShortcutKey>
      <span className="text-muted-foreground">+</span>
      <ShortcutKey>Shift</ShortcutKey>
      <span className="text-muted-foreground">+</span>
      <ShortcutKey>P</ShortcutKey>
    </div>
  ),
};

export const Grouped: Story = {
  args: {
    shortcuts: [
      { keys: ['Ctrl', 'N'], description: 'New item', group: 'General' },
      { keys: ['Ctrl', 'O'], description: 'Open', group: 'General' },
      { keys: ['Ctrl', 'C'], description: 'Copy', group: 'Edit' },
      { keys: ['Ctrl', 'V'], description: 'Paste', group: 'Edit' },
    ],
    grouped: true,
  },
};
