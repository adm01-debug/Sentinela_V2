import type { Meta, StoryObj } from '@storybook/react';
import { BlockedIPsPanel } from './BlockedIPsPanel';

const meta: Meta<typeof BlockedIPsPanel> = {
  title: 'Components/BlockedIPsPanel',
  component: BlockedIPsPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BlockedIPsPanel>;

export const Default: Story = {};
