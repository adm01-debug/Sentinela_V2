import type { Meta, StoryObj } from '@storybook/react';
import { LiveViewPanel } from './LiveViewPanel';

const meta: Meta<typeof LiveViewPanel> = {
  title: 'Components/LiveViewPanel',
  component: LiveViewPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LiveViewPanel>;

export const Default: Story = {};
