import type { Meta, StoryObj } from '@storybook/react';
import { TrendChart } from './TrendChart';

const meta: Meta<typeof TrendChart> = {
  title: 'Components/TrendChart',
  component: TrendChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TrendChart>;

export const Default: Story = {};
