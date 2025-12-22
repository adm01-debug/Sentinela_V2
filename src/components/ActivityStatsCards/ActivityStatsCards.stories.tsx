import type { Meta, StoryObj } from '@storybook/react';
import { ActivityStatsCards } from './ActivityStatsCards';

const meta: Meta<typeof ActivityStatsCards> = {
  title: 'Components/ActivityStatsCards',
  component: ActivityStatsCards,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActivityStatsCards>;

export const Default: Story = {};
