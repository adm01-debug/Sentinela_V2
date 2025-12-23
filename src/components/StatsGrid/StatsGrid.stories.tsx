import type { Meta, StoryObj } from '@storybook/react';
import { StatsGrid } from './StatsGrid';

const meta: Meta<typeof StatsGrid> = {
  title: 'Components/StatsGrid',
  component: StatsGrid,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatsGrid>;

export const Default: Story = {};
