import type { Meta, StoryObj } from '@storybook/react';
import { LiveViewCard } from '@/components/LiveViewCard';

const meta: Meta<typeof LiveViewCard> = {
  title: 'Components/LiveViewCard',
  component: LiveViewCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof LiveViewCard>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
