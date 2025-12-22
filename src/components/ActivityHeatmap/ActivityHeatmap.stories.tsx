import type { Meta, StoryObj } from '@storybook/react';
import { ActivityHeatmap } from './ActivityHeatmap';

const meta: Meta<typeof ActivityHeatmap> = {
  title: 'Components/ActivityHeatmap',
  component: ActivityHeatmap,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActivityHeatmap>;

export const Default: Story = {};
