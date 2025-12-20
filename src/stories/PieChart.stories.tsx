import type { Meta, StoryObj } from '@storybook/react';
import { PieChart } from '@/components/ui/piechart';

const meta: Meta<typeof PieChart> = {
  title: 'UI/PieChart',
  component: PieChart,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithVariants: Story = {
  args: {},
};
