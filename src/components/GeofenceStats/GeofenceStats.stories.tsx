import type { Meta, StoryObj } from '@storybook/react';
import { GeofenceStats } from './GeofenceStats';

const meta: Meta<typeof GeofenceStats> = {
  title: 'Components/GeofenceStats',
  component: GeofenceStats,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GeofenceStats>;

export const Default: Story = {};
