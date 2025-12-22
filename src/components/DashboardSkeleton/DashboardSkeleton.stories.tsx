import type { Meta, StoryObj } from '@storybook/react';
import { DashboardSkeleton } from './DashboardSkeleton';

const meta: Meta<typeof DashboardSkeleton> = {
  title: 'Components/DashboardSkeleton',
  component: DashboardSkeleton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DashboardSkeleton>;

export const Default: Story = {};
