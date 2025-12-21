import type { Meta, StoryObj } from '@storybook/react';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';

const meta: Meta<typeof KeyboardShortcutsHelp> = {
  title: 'Components/KeyboardShortcutsHelp',
  component: KeyboardShortcutsHelp,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof KeyboardShortcutsHelp>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
