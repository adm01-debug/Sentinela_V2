import type { Meta, StoryObj } from '@storybook/react';
import { AgentKeyStats } from './AgentKeyStats';

const meta: Meta<typeof AgentKeyStats> = {
  title: 'Components/AgentKeyStats',
  component: AgentKeyStats,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AgentKeyStats>;

export const Default: Story = {};
