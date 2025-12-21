import type { Meta, StoryObj } from '@storybook/react';
import { ProductivityChart } from '@/components/ProductivityChart';

const meta: Meta<typeof ProductivityChart> = {
  title: 'Components/ProductivityChart',
  component: ProductivityChart,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ProductivityChart>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
