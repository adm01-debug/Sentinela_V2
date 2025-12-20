import type { Meta, StoryObj } from '@storybook/react';
import { GamificationStats } from '@/components/gamification/GamificationStats';

const meta: Meta<typeof GamificationStats> = {
  title: 'Components/Gamification/GamificationStats',
  component: GamificationStats,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalParticipants: 150,
    totalPoints: 45000,
    topScore: 1250,
    avgScore: 300,
  },
};

export const SmallTeam: Story = {
  args: {
    totalParticipants: 10,
    totalPoints: 5000,
    topScore: 800,
    avgScore: 500,
  },
};

export const HighEngagement: Story = {
  args: {
    totalParticipants: 500,
    totalPoints: 250000,
    topScore: 5000,
    avgScore: 500,
  },
};
