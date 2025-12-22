import type { Meta, StoryObj } from '@storybook/react';
import { ProductivityScore } from './ProductivityScore';

const meta: Meta<typeof ProductivityScore> = {
  title: 'Components/ProductivityScore',
  component: ProductivityScore,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProductivityScore>;

export const Default: Story = {};
