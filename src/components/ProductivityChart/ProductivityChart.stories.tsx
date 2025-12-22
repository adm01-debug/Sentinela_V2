import type { Meta, StoryObj } from '@storybook/react';
import { ProductivityChart } from './ProductivityChart';

const meta: Meta<typeof ProductivityChart> = {
  title: 'Components/ProductivityChart',
  component: ProductivityChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProductivityChart>;

export const Default: Story = {};
