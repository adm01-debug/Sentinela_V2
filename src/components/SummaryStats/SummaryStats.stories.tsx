import type { Meta, StoryObj } from '@storybook/react';
import { SummaryStats } from './SummaryStats';

const meta: Meta<typeof SummaryStats> = {
  title: 'Components/SummaryStats',
  component: SummaryStats,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SummaryStats>;

export const Default: Story = {};
