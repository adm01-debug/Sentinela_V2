import type { Meta, StoryObj } from '@storybook/react';
import { IPWhitelistPanel } from './IPWhitelistPanel';

const meta: Meta<typeof IPWhitelistPanel> = {
  title: 'Components/IPWhitelistPanel',
  component: IPWhitelistPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IPWhitelistPanel>;

export const Default: Story = {};
