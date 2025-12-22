import type { Meta, StoryObj } from '@storybook/react';
import { ActivityChart } from './ActivityChart';

const meta: Meta<typeof ActivityChart> = {
  title: 'Components/ActivityChart',
  component: ActivityChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActivityChart>;

export const Default: Story = {};
