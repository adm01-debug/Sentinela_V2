import type { Meta, StoryObj } from '@storybook/react';
import { AIStatsCards } from './AIStatsCards';

const meta: Meta<typeof AIStatsCards> = {
  title: 'Components/AIStatsCards',
  component: AIStatsCards,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AIStatsCards>;

export const Default: Story = {};
