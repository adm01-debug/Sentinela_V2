import type { Meta, StoryObj } from '@storybook/react';
import { MonitoringStats } from './MonitoringStats';

const meta: Meta<typeof MonitoringStats> = {
  title: 'Components/MonitoringStats',
  component: MonitoringStats,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MonitoringStats>;

export const Default: Story = {};
