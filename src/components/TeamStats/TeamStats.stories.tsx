import type { Meta, StoryObj } from '@storybook/react';
import { TeamStats } from './TeamStats';

const meta: Meta<typeof TeamStats> = {
  title: 'Components/TeamStats',
  component: TeamStats,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TeamStats>;

export const Default: Story = {};
