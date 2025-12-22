import type { Meta, StoryObj } from '@storybook/react';
import { PolicyStats } from './PolicyStats';

const meta: Meta<typeof PolicyStats> = {
  title: 'Components/PolicyStats',
  component: PolicyStats,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PolicyStats>;

export const Default: Story = {};
