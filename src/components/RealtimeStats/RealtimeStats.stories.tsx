import type { Meta, StoryObj } from '@storybook/react';
import { RealtimeStats } from './RealtimeStats';

const meta: Meta<typeof RealtimeStats> = {
  title: 'Components/RealtimeStats',
  component: RealtimeStats,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RealtimeStats>;

export const Default: Story = {};
