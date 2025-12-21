import type { Meta, StoryObj } from '@storybook/react';
import { ProductivityCard } from '@/components/ProductivityCard';

const meta: Meta<typeof ProductivityCard> = {
  title: 'Components/ProductivityCard',
  component: ProductivityCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ProductivityCard>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
