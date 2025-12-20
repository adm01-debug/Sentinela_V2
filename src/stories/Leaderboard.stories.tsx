import type { Meta, StoryObj } from '@storybook/react';
import { Leaderboard } from '@/components/gamification/Leaderboard';

const meta: Meta<typeof Leaderboard> = {
  title: 'Components/Gamification/Leaderboard',
  component: Leaderboard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entries: [
      { rank: 1, employee_name: 'João Silva', avatar_url: null, points: 1250, level: 5, badges: ['star', 'trophy'] },
      { rank: 2, employee_name: 'Maria Santos', avatar_url: null, points: 1100, level: 4, badges: ['star'] },
      { rank: 3, employee_name: 'Carlos Lima', avatar_url: null, points: 980, level: 4, badges: [] },
      { rank: 4, employee_name: 'Ana Costa', avatar_url: null, points: 850, level: 3, badges: [] },
      { rank: 5, employee_name: 'Pedro Souza', avatar_url: null, points: 720, level: 3, badges: [] },
    ],
  },
};

export const TopThree: Story = {
  args: {
    entries: [
      { rank: 1, employee_name: 'Campeão', avatar_url: null, points: 5000, level: 10, badges: ['star', 'trophy', 'crown'] },
      { rank: 2, employee_name: 'Vice', avatar_url: null, points: 4500, level: 9, badges: ['star', 'trophy'] },
      { rank: 3, employee_name: 'Bronze', avatar_url: null, points: 4000, level: 8, badges: ['star'] },
    ],
  },
};

export const Empty: Story = {
  args: {
    entries: [],
  },
};
