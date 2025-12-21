import type { Meta, StoryObj } from '@storybook/react';

import { BlockedIPsPanel } from '@/components/BlockedIPsPanel';

const meta: Meta<typeof BlockedIPsPanel> = {
  title: 'Components/BlockedIPsPanel',
  component: BlockedIPsPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof BlockedIPsPanel>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
  },
};
